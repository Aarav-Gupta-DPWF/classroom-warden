import { useCallback, useEffect, useRef, useState } from 'react';
import { probeAudioChannels, type ChannelProbeResult } from './channelDetection';
import { negotiateRecorderMimeType } from './codecNegotiation';
import {
  iframePermissionError,
  insecureContextError,
  mapMediaError,
} from './mediaErrors';
import {
  isEmbedded,
  isSecureCaptureContext,
  listMediaDevices,
  queryCameraPermission,
  queryMicrophonePermission,
  type PermissionHint,
} from './permissions';
import type { CaptureErrorInfo, CaptureUiState, MediaDeviceOption, SensingMode } from '../types';

export interface UseMediaCaptureOptions {
  videoDeviceId?: string;
  audioDeviceId?: string;
  onModeDetected?: (mode: SensingMode, probe: ChannelProbeResult) => void;
}

export interface UseMediaCaptureReturn {
  uiState: CaptureUiState;
  stream: MediaStream | null;
  previewRef: React.RefObject<HTMLVideoElement | null>;
  devices: MediaDeviceOption[];
  channelProbe: ChannelProbeResult | null;
  sensingMode: SensingMode;
  error: CaptureErrorInfo | null;
  isRecording: boolean;
  recordedBlob: Blob | null;
  cameraPermission: PermissionHint;
  micPermission: PermissionHint;
  sensingActive: boolean;
  startLive: () => Promise<void>;
  stopLive: () => void;
  killSwitch: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  refreshDevices: () => Promise<void>;
  resumeAudioContext: () => Promise<void>;
}

function stopAllTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((t) => {
    try {
      t.stop();
    } catch {
      /* ignore */
    }
  });
}

export function useMediaCapture(options: UseMediaCaptureOptions = {}): UseMediaCaptureReturn {
  const [uiState, setUiState] = useState<CaptureUiState>('empty');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceOption[]>([]);
  const [channelProbe, setChannelProbe] = useState<ChannelProbeResult | null>(null);
  const [sensingMode, setSensingMode] = useState<SensingMode>('B');
  const [error, setError] = useState<CaptureErrorInfo | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [cameraPermission, setCameraPermission] = useState<PermissionHint>('unknown');
  const [micPermission, setMicPermission] = useState<PermissionHint>('unknown');
  const [sensingActive, setSensingActive] = useState(false);

  const previewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    chunksRef.current = [];
    stopAllTracks(streamRef.current);
    streamRef.current = null;
    setStream(null);

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (previewRef.current) {
      previewRef.current.srcObject = null;
    }

    void audioContextRef.current?.close();
    audioContextRef.current = null;

    setIsRecording(false);
    setSensingActive(false);
  }, []);

  const refreshDevices = useCallback(async () => {
    const list = await listMediaDevices();
    setDevices(list);
  }, []);

  useEffect(() => {
    void queryCameraPermission().then(setCameraPermission);
    void queryMicrophonePermission().then(setMicPermission);
    void refreshDevices();
  }, [refreshDevices]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    const el = previewRef.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    void el.play().catch(() => {
      /* autoplay may need user gesture on some browsers */
    });
  }, [stream]);

  const resumeAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  const applyProbe = useCallback(
    (probe: ChannelProbeResult) => {
      setChannelProbe(probe);
      setSensingMode(probe.mode);
      options.onModeDetected?.(probe.mode, probe);
      setUiState(probe.mode === 'B' ? 'degraded' : 'live');
    },
    [options],
  );

  const startLive = useCallback(async () => {
    setError(null);
    setRecordedBlob(null);

    if (!isSecureCaptureContext()) {
      setError(insecureContextError());
      setUiState('error');
      return;
    }

    if (isEmbedded()) {
      setError(iframePermissionError());
      setUiState('error');
      return;
    }

    setUiState('requesting-permission');

    const constraints: MediaStreamConstraints = {
      video: options.videoDeviceId
        ? { deviceId: { exact: options.videoDeviceId } }
        : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: options.audioDeviceId
        ? { deviceId: { exact: options.audioDeviceId } }
        : { channelCount: { ideal: 4 }, echoCancellation: false, noiseSuppression: false },
    };

    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstErr) {
        if (firstErr instanceof DOMException && firstErr.name === 'OverconstrainedError') {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        } else {
          throw firstErr;
        }
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setSensingActive(true);

      await refreshDevices();
      setCameraPermission(await queryCameraPermission());
      setMicPermission(await queryMicrophonePermission());

      const probe = probeAudioChannels(mediaStream);
      applyProbe(probe);
    } catch (err) {
      cleanup();
      const mapped = mapMediaError(err);
      setError(mapped);
      setUiState(err instanceof DOMException && err.name === 'NotAllowedError' ? 'denied' : 'error');
    }
  }, [applyProbe, cleanup, options.audioDeviceId, options.videoDeviceId, refreshDevices]);

  const stopLive = useCallback(() => {
    cleanup();
    setUiState('empty');
    setChannelProbe(null);
  }, [cleanup]);

  const killSwitch = useCallback(() => {
    cleanup();
    setUiState('empty');
    setChannelProbe(null);
    setError(null);
  }, [cleanup]);

  const startRecording = useCallback(() => {
    const current = streamRef.current;
    if (!current) return;

    const mimeType = negotiateRecorderMimeType();
    if (!mimeType) {
      setError({
        code: 'NoRecorderCodec',
        userMessage: 'This browser cannot record video in a supported format. Try Chrome or a recent Safari.',
      });
      setUiState('error');
      return;
    }

    chunksRef.current = [];
    const recorder = new MediaRecorder(current, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setRecordedBlob(blob);
      setUiState(sensingMode === 'B' ? 'degraded' : 'live');
    };
    recorder.start(1000);
    recorderRef.current = recorder;
    setIsRecording(true);
    setUiState('recording');
  }, [sensingMode]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setIsRecording(false);
  }, []);

  return {
    uiState,
    stream,
    previewRef,
    devices,
    channelProbe,
    sensingMode,
    error,
    isRecording,
    recordedBlob,
    cameraPermission,
    micPermission,
    sensingActive,
    startLive,
    stopLive,
    killSwitch,
    startRecording,
    stopRecording,
    refreshDevices,
    resumeAudioContext,
  };
}

import { useCallback, useId, useRef, useState } from 'react';
import type { CAAConfig, CaptureUiState } from '../types';
import { hasValidConsent } from './chunkedUpload';
import { consentRequiredError } from './mediaErrors';
import { useMediaCapture } from './useMediaCapture';
import { validateUploadFile } from './uploadValidation';
import { chunkedUpload } from './chunkedUpload';
import './CaptureLayer.css';

export interface CaptureLayerProps {
  config: CAAConfig;
  /** Parent may set fusion-driven low-confidence state */
  fusionUiState?: Extract<CaptureUiState, 'low-confidence'>;
  onUploadComplete?: (uploadId: string) => void;
}

export function CaptureLayer({ config, fusionUiState, onUploadComplete }: CaptureLayerProps) {
  const [videoDeviceId, setVideoDeviceId] = useState<string>('');
  const [audioDeviceId, setAudioDeviceId] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const liveRegionId = useId();

  const landmarkBlocked =
    config.visionMode === 'landmark-assisted' &&
    !hasValidConsent(config.consentArtifacts, 'landmark-assisted');

  const capture = useMediaCapture({
    videoDeviceId: videoDeviceId || undefined,
    audioDeviceId: audioDeviceId || undefined,
  });

  const displayState: CaptureUiState =
    fusionUiState === 'low-confidence' && capture.sensingActive
      ? 'low-confidence'
      : capture.uiState;

  const handleStartLive = useCallback(async () => {
    if (landmarkBlocked) {
      capture.killSwitch();
      return;
    }
    await capture.resumeAudioContext();
    await capture.startLive();
  }, [capture, landmarkBlocked]);

  const processUploadFile = useCallback(
    async (file: File) => {
      setUploadError(null);
      setUploadProgress(null);

      if (!hasValidConsent(config.consentArtifacts, 'upload')) {
        setUploadError(consentRequiredError('Retrospective upload').userMessage);
        return;
      }

      if (!config.uploadEndpoint) {
        setUploadError('Upload endpoint is not configured. Contact your administrator.');
        return;
      }

      const validation = await validateUploadFile(file);
      if (!validation.ok) {
        setUploadError(validation.error ?? 'Invalid file.');
        return;
      }

      capture.killSwitch();
      uploadAbortRef.current?.abort();
      uploadAbortRef.current = new AbortController();

      try {
        const uploadId = await chunkedUpload({
          endpoint: config.uploadEndpoint,
          file,
          onProgress: setUploadProgress,
          signal: uploadAbortRef.current.signal,
        });
        setUploadProgress(100);
        onUploadComplete?.(uploadId);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed.');
      }
    },
    [config.consentArtifacts, config.uploadEndpoint, capture, onUploadComplete],
  );

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void processUploadFile(file);
      e.target.value = '';
    },
    [processUploadFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void processUploadFile(file);
    },
    [processUploadFile],
  );

  if (landmarkBlocked && capture.uiState === 'empty') {
    return (
      <section className="caa-capture" aria-labelledby="caa-title">
        <ConsentBlock message={consentRequiredError('Landmark-assisted vision').userMessage} />
      </section>
    );
  }

  return (
    <section className="caa-capture" aria-labelledby="caa-title">
      <header className="caa-capture-header">
        <h2 id="caa-title">Classroom Acoustic Awareness</h2>
        {capture.sensingActive && (
          <div className="caa-sensing-indicator" role="status" aria-live="polite">
            <span className="caa-sensing-dot" aria-hidden />
            Sensing active — students can see this indicator
          </div>
        )}
      </header>

      <div id={liveRegionId} className="caa-live-region" aria-live="polite" aria-atomic="true">
        <StateAnnouncer state={displayState} probeReason={capture.channelProbe?.reason} />
      </div>

      {capture.channelProbe?.mode === 'B' && capture.sensingActive && (
        <div className="caa-degraded-banner" role="alert">
          {capture.channelProbe.reason}
        </div>
      )}

      {capture.error && (
        <div className="caa-error-banner" role="alert">
          <strong>Unable to start capture</strong>
          <p>{capture.error.userMessage}</p>
        </div>
      )}

      {uploadError && (
        <div className="caa-error-banner" role="alert">
          <strong>Upload</strong>
          <p>{uploadError}</p>
        </div>
      )}

      <div className="caa-capture-body">
        <div className="caa-preview-wrap">
          <video
            ref={capture.previewRef}
            className="caa-preview"
            playsInline
            muted
            autoPlay
            aria-label="Classroom camera preview"
          />
          {displayState === 'empty' && (
            <div className="caa-preview-placeholder">
              <p>Camera preview will appear here after you start a live session.</p>
            </div>
          )}
          {displayState === 'requesting-permission' && (
            <div className="caa-preview-overlay">Requesting camera and microphone permission…</div>
          )}
          {displayState === 'processing' && (
            <div className="caa-preview-overlay">Processing…</div>
          )}
        </div>

        <aside className="caa-controls">
          <fieldset className="caa-device-fieldset">
            <legend>Devices</legend>
            <label>
              Camera
              <select
                value={videoDeviceId}
                onChange={(e) => setVideoDeviceId(e.target.value)}
                disabled={capture.sensingActive}
              >
                <option value="">Default camera</option>
                {capture.devices
                  .filter((d) => d.kind === 'videoinput')
                  .map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Microphone
              <select
                value={audioDeviceId}
                onChange={(e) => setAudioDeviceId(e.target.value)}
                disabled={capture.sensingActive}
              >
                <option value="">Default microphone</option>
                {capture.devices
                  .filter((d) => d.kind === 'audioinput')
                  .map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label}
                    </option>
                  ))}
              </select>
            </label>
            <p className="caa-perm-hint">
              Camera: {capture.cameraPermission} · Mic: {capture.micPermission}
            </p>
          </fieldset>

          <div className="caa-actions">
            {!capture.sensingActive ? (
              <button type="button" className="caa-btn caa-btn-primary" onClick={() => void handleStartLive()}>
                Start live sensing
              </button>
            ) : (
              <>
                {!capture.isRecording ? (
                  <button type="button" className="caa-btn" onClick={capture.startRecording}>
                    Record locally
                  </button>
                ) : (
                  <button type="button" className="caa-btn" onClick={capture.stopRecording}>
                    Stop recording
                  </button>
                )}
                <button type="button" className="caa-btn caa-btn-danger" onClick={capture.killSwitch}>
                  Kill switch — stop all sensing
                </button>
              </>
            )}
          </div>

          <div
            className={`caa-upload-zone ${isDragging ? 'caa-upload-zone--drag' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
          >
            <p>Retrospective analysis upload (requires school consent)</p>
            <button type="button" className="caa-btn" onClick={() => fileInputRef.current?.click()}>
              Choose video file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="caa-sr-only"
              onChange={onFileInput}
            />
            {uploadProgress !== null && (
              <progress max={100} value={uploadProgress} aria-label="Upload progress">
                {uploadProgress}%
              </progress>
            )}
          </div>

          <StatusBadge state={displayState} mode={capture.sensingMode} />
        </aside>
      </div>
    </section>
  );
}

function ConsentBlock({ message }: { message: string }) {
  return (
    <div className="caa-error-banner" role="alert">
      <strong>Consent required</strong>
      <p>{message}</p>
    </div>
  );
}

function StateAnnouncer({
  state,
  probeReason,
}: {
  state: CaptureUiState;
  probeReason?: string;
}) {
  const messages: Record<CaptureUiState, string> = {
    empty: 'Ready. Live sensing is off.',
    'requesting-permission': 'Waiting for camera and microphone permission.',
    denied: 'Permission denied. Update browser settings to allow access.',
    live: 'Live sensing active with zone detection.',
    recording: 'Recording locally. Upload is separate and requires consent.',
    processing: 'Processing recording.',
    degraded: probeReason ?? 'Room-level sensing only. Zones unavailable.',
    'low-confidence': 'Low confidence detections are hidden from view.',
    error: 'Capture error. See message above.',
  };
  return <span className="caa-sr-only">{messages[state]}</span>;
}

function StatusBadge({ state, mode }: { state: CaptureUiState; mode: 'A' | 'B' }) {
  return (
    <div className="caa-status-badge" aria-hidden>
      <span className="caa-status-label">State: {state}</span>
      <span className="caa-status-label">Mode: {mode}</span>
    </div>
  );
}

export default CaptureLayer;

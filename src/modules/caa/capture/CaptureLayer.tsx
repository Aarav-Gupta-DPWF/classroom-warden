import { useCallback, useId, useState } from 'react';
import type { CAAConfig, CaptureUiState } from '../types';
import { useMediaCapture } from './useMediaCapture';
import './CaptureLayer.css';

export interface CaptureLayerProps {
  config?: CAAConfig;
  /** Parent may set fusion-driven low-confidence state */
  fusionUiState?: Extract<CaptureUiState, 'low-confidence'>;
}

export function CaptureLayer({ config: _config, fusionUiState }: CaptureLayerProps) {
  const [videoDeviceId, setVideoDeviceId] = useState<string>('');
  const [audioDeviceId, setAudioDeviceId] = useState<string>('');
  const liveRegionId = useId();

  const capture = useMediaCapture({
    videoDeviceId: videoDeviceId || undefined,
    audioDeviceId: audioDeviceId || undefined,
  });

  const displayState: CaptureUiState =
    fusionUiState === 'low-confidence' && capture.sensingActive
      ? 'low-confidence'
      : capture.uiState;

  const handleStartLive = useCallback(async () => {
    await capture.resumeAudioContext();
    await capture.startLive();
  }, [capture]);

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

          <StatusBadge state={displayState} mode={capture.sensingMode} />
        </aside>
      </div>
    </section>
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
    recording: 'Recording locally on this device.',
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

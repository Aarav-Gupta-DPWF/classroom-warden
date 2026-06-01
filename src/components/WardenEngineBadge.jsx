import { useAudioEngine } from '../context/AudioContext';

export default function WardenEngineBadge() {
  const { audioUnlocked, isMuted, ambientEnabled } = useAudioEngine();

  if (!audioUnlocked) return null;

  const on = !isMuted;

  return (
    <div className="warden-engine-group">
      <div
        className={`warden-engine-badge${on ? ' active' : ''}`}
        title={on ? 'Warden Calm Engine — audio on' : 'Audio muted'}
      >
        <span className="warden-engine-dot" />
        <span className="warden-engine-label">{on ? 'Calm Audio' : 'Muted'}</span>
      </div>
      {on && ambientEnabled && (
        <span className="warden-engine-ambient-pill">Ambient</span>
      )}
    </div>
  );
}

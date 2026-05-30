import { useAudioEngine } from '../context/AudioContext';

export default function WardenEngineBadge() {
  const { audioUnlocked, isMuted, ambientEnabled } = useAudioEngine();

  if (!audioUnlocked) return null;

  const on = !isMuted;

  return (
    <div
      className={`warden-engine-badge${on ? ' active' : ''}`}
      title={on ? 'Warden Calm Engine — audio on' : 'Audio muted'}
    >
      <span className="warden-engine-dot" />
      {on ? 'Calm Audio' : 'Muted'}
      {on && ambientEnabled && <span className="warden-engine-amb"> · Ambient</span>}
    </div>
  );
}

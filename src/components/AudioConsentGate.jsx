import { motion } from 'framer-motion';
import { useAudioEngine } from '../context/AudioContext';

export default function AudioConsentGate() {
  const { audioUnlocked, unlockAudio } = useAudioEngine();

  if (audioUnlocked) return null;

  const handleEnter = () => {
    void unlockAudio();
  };

  return (
    <motion.div
      className="audio-consent-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="audio-consent-card glass-card"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="audio-consent-icon">🎧</div>
        <h2 className="audio-consent-title">Calm Audio Experience</h2>
        <p className="audio-consent-copy">
          Gentle UI sounds and a soft ambient background help you stay focused.
          Tap below to enable audio — your browser requires a click first.
        </p>
        <motion.button
          type="button"
          className="audio-consent-btn"
          onClick={handleEnter}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Enter Dashboard
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

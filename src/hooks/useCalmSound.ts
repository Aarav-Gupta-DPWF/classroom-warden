'use client';

import { useAudioEngine } from '../context/AudioContext';

export const useCalmSound = () => {
  const { playSound, isMuted, unlockAudio, audioUnlocked } = useAudioEngine();

  const withUnlock = (fn: () => void) => () => {
    if (!audioUnlocked) {
      void unlockAudio();
    }
    fn();
  };

  return {
    playTap: withUnlock(() => playSound('uiClick')),
    playSuccess: withUnlock(() => playSound('successChime')),
    playWarning: withUnlock(() => playSound('alertSoft')),
    unlockAudio,
    audioDisabled: isMuted,
    audioUnlocked,
  };
};

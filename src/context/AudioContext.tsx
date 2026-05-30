'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  CALM_AUDIO_STORAGE_KEY,
  loadCalmAudioPrefs,
  saveCalmAudioPrefs,
  SoundName,
  VOLUME,
} from '../utils/audioAssets';
import { calmSynth } from '../utils/calmAudioSynth';

interface AudioContextType {
  isMuted: boolean;
  masterVolume: number;
  ambientEnabled: boolean;
  audioUnlocked: boolean;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  setAmbientEnabled: (enabled: boolean) => void;
  playSound: (soundName: SoundName) => void;
  startAmbient: () => void;
  stopAmbient: () => void;
  unlockAudio: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

function dispatchSound(name: SoundName, volume: number) {
  calmSynth.setOutput(volume, false);
  switch (name) {
    case 'uiClick':
      calmSynth.playUiClick();
      break;
    case 'successChime':
      calmSynth.playSuccess();
      break;
    case 'alertSoft':
      calmSynth.playWarning();
      break;
    default:
      break;
  }
}

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialPrefs = loadCalmAudioPrefs();
  const [isMuted, setIsMuted] = useState(initialPrefs.isMuted);
  const [masterVolume, setMasterVolume] = useState(initialPrefs.masterVolume);
  const [ambientEnabled, setAmbientEnabledState] = useState(initialPrefs.ambientEnabled);
  const [audioUnlocked, setAudioUnlocked] = useState(
    () =>
      typeof window !== 'undefined' &&
      localStorage.getItem(`${CALM_AUDIO_STORAGE_KEY}-unlocked`) === '1',
  );

  const masterVolumeRef = useRef(masterVolume);
  const isMutedRef = useRef(isMuted);
  const audioUnlockedRef = useRef(audioUnlocked);

  masterVolumeRef.current = masterVolume;
  isMutedRef.current = isMuted;
  audioUnlockedRef.current = audioUnlocked;

  useEffect(() => {
    calmSynth.setOutput(masterVolume, isMuted);
  }, [masterVolume, isMuted]);

  useEffect(() => {
    saveCalmAudioPrefs({ masterVolume, isMuted, ambientEnabled });
  }, [masterVolume, isMuted, ambientEnabled]);

  const stopAmbient = useCallback(() => {
    calmSynth.stopAmbient();
  }, []);

  const startAmbient = useCallback(() => {
    if (isMutedRef.current || !ambientEnabled || !audioUnlockedRef.current) return;
    if (calmSynth.isAmbientPlaying()) return;
    void calmSynth.init().then(() => {
      calmSynth.startAmbient();
      console.log('[WardenCalmEngine] Ambient drone started (synthesized)');
    });
  }, [ambientEnabled]);

  const unlockAudio = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      await calmSynth.init();
      setAudioUnlocked(true);
      audioUnlockedRef.current = true;
      localStorage.setItem(`${CALM_AUDIO_STORAGE_KEY}-unlocked`, '1');
      calmSynth.setOutput(masterVolumeRef.current, false);
      calmSynth.playUiClick();
      console.log('[WardenCalmEngine] Audio unlocked — Web Audio active');
      if (ambientEnabled && !isMutedRef.current) startAmbient();
    } catch (err) {
      console.warn('[WardenCalmEngine] Audio unlock failed:', err);
    }
  }, [ambientEnabled, startAmbient]);

  useEffect(() => {
    if (!audioUnlocked) return;
    void calmSynth.init();
    if (ambientEnabled && !isMuted) startAmbient();
    else stopAmbient();
  }, [audioUnlocked, ambientEnabled, isMuted, startAmbient, stopAmbient]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      calmSynth.setOutput(masterVolumeRef.current, next);
      if (next) stopAmbient();
      else if (audioUnlockedRef.current && ambientEnabled) startAmbient();
      return next;
    });
  }, [ambientEnabled, startAmbient, stopAmbient]);

  const setVolume = useCallback((volume: number) => {
    const normalized = Math.max(0, Math.min(1, volume));
    setMasterVolume(normalized);
    calmSynth.setOutput(normalized, isMutedRef.current);
  }, []);

  const setAmbientEnabled = useCallback(
    (enabled: boolean) => {
      setAmbientEnabledState(enabled);
      if (!enabled) stopAmbient();
      else if (audioUnlockedRef.current && !isMutedRef.current) startAmbient();
    },
    [startAmbient, stopAmbient],
  );

  const playSound = useCallback((soundName: SoundName) => {
    if (isMutedRef.current || soundName === 'ambientLoop') return;
    void calmSynth.init().then(() => {
      if (!audioUnlockedRef.current) return;
      dispatchSound(soundName, masterVolumeRef.current);
    });
  }, []);

  useEffect(() => {
    console.log('[WardenCalmEngine] Initialized (procedural Web Audio — no external CDN)');
  }, []);

  return (
    <AudioContext.Provider
      value={{
        isMuted,
        masterVolume,
        ambientEnabled,
        audioUnlocked,
        toggleMute,
        setVolume,
        setAmbientEnabled,
        playSound,
        startAmbient,
        stopAmbient,
        unlockAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioEngine = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudioEngine must be used within an AudioProvider');
  return context;
};

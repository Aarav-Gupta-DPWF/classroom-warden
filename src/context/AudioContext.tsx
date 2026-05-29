'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Howl, Howler } from 'howler';
import {
  CALM_AUDIO_STORAGE_KEY,
  FADE_MS,
  loadCalmAudioPrefs,
  saveCalmAudioPrefs,
  SOUND_MANIFEST,
  SoundName,
  VOLUME,
} from '../utils/audioAssets';

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

function getSoundVolume(name: SoundName, master: number): number {
  if (name === 'ambientLoop') return master * VOLUME.ambient;
  if (name === 'uiClick') return master * VOLUME.uiClick;
  return master;
}

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialPrefs = loadCalmAudioPrefs();
  const [isMuted, setIsMuted] = useState(initialPrefs.isMuted);
  const [masterVolume, setMasterVolume] = useState(initialPrefs.masterVolume);
  const [ambientEnabled, setAmbientEnabledState] = useState(initialPrefs.ambientEnabled);
  const [audioUnlocked, setAudioUnlocked] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(`${CALM_AUDIO_STORAGE_KEY}-unlocked`) === '1',
  );

  const soundsRef = useRef<Partial<Record<SoundName, Howl>>>({});
  const ambientStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const masterVolumeRef = useRef(masterVolume);
  const isMutedRef = useRef(isMuted);

  masterVolumeRef.current = masterVolume;
  isMutedRef.current = isMuted;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    Object.entries(SOUND_MANIFEST).forEach(([key, url]) => {
      const name = key as SoundName;
      soundsRef.current[name] = new Howl({
        src: [url],
        html5: name === 'ambientLoop',
        loop: name === 'ambientLoop',
        volume: 0,
        preload: true,
        onloaderror: (_id, err) => {
          console.warn(`[WardenCalmEngine] Failed to preload "${name}":`, err);
        },
      });
    });

    console.log('[WardenCalmEngine] Sound manifest pre-loaded');

    return () => {
      if (ambientStopTimerRef.current) clearTimeout(ambientStopTimerRef.current);
      Object.values(soundsRef.current).forEach((sound) => sound?.unload());
      soundsRef.current = {};
    };
  }, []);

  useEffect(() => {
    saveCalmAudioPrefs({ masterVolume, isMuted, ambientEnabled });
  }, [masterVolume, isMuted, ambientEnabled]);

  const stopAmbient = useCallback(() => {
    const ambient = soundsRef.current.ambientLoop;
    if (!ambient?.playing()) return;

    if (ambientStopTimerRef.current) clearTimeout(ambientStopTimerRef.current);

    const currentVol = getSoundVolume('ambientLoop', masterVolumeRef.current);
    ambient.fade(currentVol, 0, FADE_MS.ambientOut);
    ambientStopTimerRef.current = setTimeout(() => {
      ambient.stop();
      ambient.volume(0);
      ambientStopTimerRef.current = null;
    }, FADE_MS.ambientOut);
  }, []);

  const startAmbient = useCallback(() => {
    if (isMutedRef.current || !ambientEnabled) return;

    const ambient = soundsRef.current.ambientLoop;
    if (!ambient || ambient.playing()) return;

    if (ambientStopTimerRef.current) {
      clearTimeout(ambientStopTimerRef.current);
      ambientStopTimerRef.current = null;
    }

    const targetVol = getSoundVolume('ambientLoop', masterVolumeRef.current);
    ambient.volume(0);
    ambient.play();
    ambient.fade(0, targetVol, FADE_MS.ambientIn);
    console.log('[WardenCalmEngine] Ambient loop started');
  }, [ambientEnabled]);

  const unlockAudio = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const ctx = Howler.ctx;
      if (ctx?.state === 'suspended') {
        await ctx.resume();
      }
      setAudioUnlocked(true);
      localStorage.setItem(`${CALM_AUDIO_STORAGE_KEY}-unlocked`, '1');
      console.log('[WardenCalmEngine] Audio unlocked via user gesture');

      if (ambientEnabled && !isMutedRef.current) {
        startAmbient();
      }
    } catch (err) {
      console.warn('[WardenCalmEngine] Audio unlock failed:', err);
    }
  }, [ambientEnabled, startAmbient]);

  useEffect(() => {
    if (!audioUnlocked) return;
    if (ambientEnabled && !isMuted) startAmbient();
    else stopAmbient();
  }, [audioUnlocked, ambientEnabled, isMuted, startAmbient, stopAmbient]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) stopAmbient();
      else if (audioUnlocked && ambientEnabled) startAmbient();
      return next;
    });
  }, [audioUnlocked, ambientEnabled, startAmbient, stopAmbient]);

  const setVolume = useCallback((volume: number) => {
    const normalized = Math.max(0, Math.min(1, volume));
    setMasterVolume(normalized);

    const ambient = soundsRef.current.ambientLoop;
    if (ambient?.playing() && !isMutedRef.current) {
      ambient.volume(getSoundVolume('ambientLoop', normalized));
    }
  }, []);

  const setAmbientEnabled = useCallback(
    (enabled: boolean) => {
      setAmbientEnabledState(enabled);
      if (!enabled) stopAmbient();
      else if (audioUnlocked && !isMutedRef.current) startAmbient();
    },
    [audioUnlocked, startAmbient, stopAmbient],
  );

  const playSound = useCallback((soundName: SoundName) => {
    if (isMutedRef.current) return;

    const sound = soundsRef.current[soundName];
    if (!sound) return;

    const targetVol = getSoundVolume(soundName, masterVolumeRef.current);

    if (soundName === 'successChime' || soundName === 'alertSoft') {
      sound.stop();
      sound.volume(0);
      sound.play();
      sound.fade(0, targetVol, soundName === 'successChime' ? FADE_MS.chime : FADE_MS.alert);
      return;
    }

    if (soundName === 'uiClick') {
      sound.volume(targetVol);
      sound.play();
      return;
    }

    sound.volume(targetVol);
    sound.play();
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

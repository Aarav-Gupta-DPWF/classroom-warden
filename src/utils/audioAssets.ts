export const SOUND_MANIFEST = {
  ambientLoop: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav',
  uiClick: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-84.wav',
  successChime: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav',
  alertSoft: 'https://assets.mixkit.co/active_storage/sfx/911/911-84.wav',
} as const;

export type SoundName = keyof typeof SOUND_MANIFEST;

export const FADE_MS = {
  ui: 200,
  chime: 350,
  alert: 400,
  ambientIn: 2000,
  ambientOut: 1000,
} as const;

export const VOLUME = {
  defaultMaster: 0.4,
  uiClick: 0.55,
  ambient: 0.35,
} as const;

export const CALM_AUDIO_STORAGE_KEY = 'cw-calm-audio';

export interface CalmAudioPrefs {
  masterVolume: number;
  isMuted: boolean;
  ambientEnabled: boolean;
}

export const DEFAULT_CALM_AUDIO_PREFS: CalmAudioPrefs = {
  masterVolume: VOLUME.defaultMaster,
  isMuted: false,
  ambientEnabled: true,
};

export function loadCalmAudioPrefs(): CalmAudioPrefs {
  if (typeof window === 'undefined') return DEFAULT_CALM_AUDIO_PREFS;
  try {
    const raw = localStorage.getItem(CALM_AUDIO_STORAGE_KEY);
    if (!raw) return DEFAULT_CALM_AUDIO_PREFS;
    return { ...DEFAULT_CALM_AUDIO_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CALM_AUDIO_PREFS;
  }
}

export function saveCalmAudioPrefs(prefs: CalmAudioPrefs): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CALM_AUDIO_STORAGE_KEY, JSON.stringify(prefs));
}

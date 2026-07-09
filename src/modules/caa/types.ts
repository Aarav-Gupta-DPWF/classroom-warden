/** Classroom Acoustic Awareness — shared types */

export type SensingMode = 'A' | 'B';

export type CaptureUiState =
  | 'empty'
  | 'requesting-permission'
  | 'denied'
  | 'live'
  | 'recording'
  | 'processing'
  | 'degraded'
  | 'low-confidence'
  | 'error';

export type VisionSubMode = 'landmark-free' | 'landmark-assisted';

export type ZoneId = 'front-left' | 'front-right' | 'back-left' | 'back-right';

export interface ZoneActivityTuple {
  zone_id: ZoneId;
  activity: number;
  confidence: number;
  ts: number;
}

export interface RoomLevelTuple {
  room_activity: number;
  confidence: number;
  ts: number;
  mode: 'B';
}

export interface CAAConfig {
  visionMode: VisionSubMode;
  analyticsOptIn: boolean;
  zoneCount: 2 | 4;
}

export interface MediaDeviceOption {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface CaptureErrorInfo {
  code: string;
  userMessage: string;
  technicalDetail?: string;
}

export const MIN_ARRAY_CHANNELS = 4;

export const MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4;codecs=avc1,mp4a.40.2',
  'video/mp4',
] as const;

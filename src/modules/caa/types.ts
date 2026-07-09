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

export interface ConsentArtifact {
  id: string;
  issuedAt: string; // ISO
  expiresAt: string; // ISO
  scope: 'upload' | 'landmark-assisted';
  issuer: string;
}

export interface CAAConfig {
  visionMode: VisionSubMode;
  consentArtifacts: ConsentArtifact[];
  analyticsOptIn: boolean;
  zoneCount: 2 | 4;
  uploadEndpoint?: string;
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

export const UPLOAD_LIMITS = {
  maxBytes: 400 * 1024 * 1024,
  maxDurationSec: 3600,
} as const;

export const MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4;codecs=avc1,mp4a.40.2',
  'video/mp4',
] as const;

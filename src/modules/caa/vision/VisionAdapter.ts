import type { ZoneId } from '../types';

export interface ZoneGeometry {
  zone_id: ZoneId;
  /** Normalized 0–1 bounding box in frame coordinates */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VisualZoneFrame {
  ts: number;
  zones: Array<{
    zone_id: ZoneId;
    person_count: number;
    motion_energy: number; // 0.0–1.0 scalar, no landmarks
  }>;
}

/** All vision backends must implement this contract (ADR-002). */
export interface VisionAdapter {
  readonly mode: 'landmark-free' | 'landmark-assisted';
  init(weightsUrl: string): Promise<void>;
  infer(frame: ImageBitmap, zones: ZoneGeometry[]): Promise<VisualZoneFrame>;
  dispose(): void;
}

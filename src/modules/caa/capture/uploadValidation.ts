import { UPLOAD_LIMITS } from '../types';

export interface UploadValidationResult {
  ok: boolean;
  durationSec?: number;
  error?: string;
}

export function validateUploadSize(file: File): UploadValidationResult {
  if (file.size > UPLOAD_LIMITS.maxBytes) {
    return {
      ok: false,
      error: `File exceeds ${Math.round(UPLOAD_LIMITS.maxBytes / (1024 * 1024))}MB limit.`,
    };
  }
  return { ok: true };
}

/** Probe duration via detached video element — client-side only */
export function probeVideoMetadata(file: File): Promise<UploadValidationResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      video.load();
    };

    video.addEventListener('loadedmetadata', () => {
      const duration = video.duration;
      cleanup();
      if (!Number.isFinite(duration)) {
        resolve({ ok: false, error: 'Could not read video duration.' });
        return;
      }
      if (duration > UPLOAD_LIMITS.maxDurationSec) {
        resolve({
          ok: false,
          error: `Recording exceeds ${UPLOAD_LIMITS.maxDurationSec / 60} minute limit.`,
        });
        return;
      }
      resolve({ ok: true, durationSec: duration });
    });

    video.addEventListener('error', () => {
      cleanup();
      resolve({ ok: false, error: 'Unsupported or corrupt video container.' });
    });

    video.src = url;
  });
}

export async function validateUploadFile(file: File): Promise<UploadValidationResult> {
  if (!file.type.startsWith('video/')) {
    return { ok: false, error: 'Please select a video file.' };
  }
  const sizeCheck = validateUploadSize(file);
  if (!sizeCheck.ok) return sizeCheck;
  return probeVideoMetadata(file);
}

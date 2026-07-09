import { MIME_CANDIDATES } from '../types';

/** Probe MediaRecorder support — never hardcode a single mimeType. verify against current MDN/caniuse */
export function negotiateRecorderMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  for (const candidate of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate;
  }
  return null;
}

export function isMediaRecorderAvailable(): boolean {
  return typeof MediaRecorder !== 'undefined' && negotiateRecorderMimeType() !== null;
}

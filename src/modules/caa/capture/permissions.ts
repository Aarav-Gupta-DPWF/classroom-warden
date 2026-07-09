import type { MediaDeviceOption } from '../types';

export async function listMediaDevices(): Promise<MediaDeviceOption[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter((d) => d.kind === 'videoinput' || d.kind === 'audioinput')
    .map((d) => ({
      deviceId: d.deviceId,
      label: d.label || `${d.kind === 'videoinput' ? 'Camera' : 'Microphone'} (${d.deviceId.slice(0, 8)}…)`,
      kind: d.kind,
    }));
}

export type PermissionHint = 'granted' | 'denied' | 'prompt' | 'unknown';

/** Chromium-oriented; feature-detect and fall back. verify against current MDN */
export async function queryCameraPermission(): Promise<PermissionHint> {
  if (!navigator.permissions?.query) return 'unknown';
  try {
    // @ts-expect-error — camera permission name not in all TS lib defs
    const status = await navigator.permissions.query({ name: 'camera' });
    return status.state as PermissionHint;
  } catch {
    return 'unknown';
  }
}

export async function queryMicrophonePermission(): Promise<PermissionHint> {
  if (!navigator.permissions?.query) return 'unknown';
  try {
    // @ts-expect-error — microphone permission name not in all TS lib defs
    const status = await navigator.permissions.query({ name: 'microphone' });
    return status.state as PermissionHint;
  } catch {
    return 'unknown';
  }
}

export function isEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function isSecureCaptureContext(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext;
}

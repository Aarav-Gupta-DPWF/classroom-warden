import type { CaptureErrorInfo } from '../types';

type DomExceptionName =
  | 'NotAllowedError'
  | 'NotFoundError'
  | 'NotReadableError'
  | 'OverconstrainedError'
  | 'SecurityError'
  | 'AbortError';

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'Microsoft Edge';
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return 'Google Chrome';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari';
  return 'your browser';
}

function settingsPath(browser: string, kind: 'camera' | 'microphone'): string {
  if (browser.includes('Chrome') || browser.includes('Edge')) {
    return kind === 'camera'
      ? 'Settings → Privacy and security → Site settings → Camera'
      : 'Settings → Privacy and security → Site settings → Microphone';
  }
  if (browser === 'Firefox') {
    return 'Settings → Privacy & Security → Permissions → ' + (kind === 'camera' ? 'Camera' : 'Microphone');
  }
  if (browser === 'Safari') {
    return 'Settings → Websites → ' + (kind === 'camera' ? 'Camera' : 'Microphone');
  }
  return 'your browser privacy settings';
}

export function mapMediaError(
  error: unknown,
  context: { deviceKind?: 'camera' | 'microphone'; constraint?: string } = {},
): CaptureErrorInfo {
  const browser = detectBrowser();
  const name = error instanceof DOMException ? (error.name as DomExceptionName) : 'UnknownError';
  const device = context.deviceKind ?? 'camera';

  switch (name) {
    case 'NotAllowedError':
      return {
        code: name,
        userMessage: `${device === 'camera' ? 'Camera' : 'Microphone'} access was blocked. Open ${settingsPath(browser, device)} and allow access for this site, then reload and try again.`,
        technicalDetail: error instanceof Error ? error.message : undefined,
      };
    case 'NotFoundError':
      return {
        code: name,
        userMessage: `No ${device} was found on this device. Connect a ${device} or choose a different device in the picker.`,
        technicalDetail: error instanceof Error ? error.message : undefined,
      };
    case 'NotReadableError':
      return {
        code: name,
        userMessage: `The ${device} is in use by another application (Zoom, Teams, etc.). Close the other app and retry.`,
        technicalDetail: error instanceof Error ? error.message : undefined,
      };
    case 'OverconstrainedError':
      return {
        code: name,
        userMessage: context.constraint
          ? `This ${device} does not support: ${context.constraint}. Try another device or lower quality settings.`
          : `Camera or microphone constraints could not be met. Retrying with relaxed settings…`,
        technicalDetail: error instanceof Error ? error.message : undefined,
      };
    case 'SecurityError':
      return {
        code: name,
        userMessage:
          'Camera and microphone require a secure connection (HTTPS) or localhost. Open this page via https:// or http://localhost.',
        technicalDetail: error instanceof Error ? error.message : undefined,
      };
    case 'AbortError':
      return {
        code: name,
        userMessage: 'The device stopped unexpectedly. Retry once. If this continues, reconnect hardware or contact support.',
        technicalDetail: error instanceof Error ? error.message : undefined,
      };
    default:
      return {
        code: name,
        userMessage: 'An unexpected media error occurred. Retry or choose a different device.',
        technicalDetail: error instanceof Error ? error.message : String(error),
      };
  }
}

export function insecureContextError(): CaptureErrorInfo {
  return {
    code: 'InsecureContext',
    userMessage:
      'Camera and microphone require a secure connection (HTTPS) or localhost. Open this page via https:// or http://localhost.',
  };
}

export function iframePermissionError(): CaptureErrorInfo {
  return {
    code: 'IframePermissions',
    userMessage:
      'This page is embedded in another site. The parent page must include allow="camera; microphone" on the iframe. Ask your administrator to update the embed code.',
  };
}

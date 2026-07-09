import type { ConsentArtifact } from '../types';

export function hasValidConsent(
  artifacts: ConsentArtifact[],
  scope: ConsentArtifact['scope'],
): boolean {
  const now = Date.now();
  return artifacts.some((a) => {
    if (a.scope !== scope) return false;
    const exp = Date.parse(a.expiresAt);
    return Number.isFinite(exp) && exp > now;
  });
}

export interface UploadCheckpoint {
  uploadId: string;
  fileName: string;
  offset: number;
  totalSize: number;
}

const CHECKPOINT_KEY = 'caa_upload_checkpoint';

export function loadCheckpoint(): UploadCheckpoint | null {
  try {
    const raw = localStorage.getItem(CHECKPOINT_KEY);
    return raw ? (JSON.parse(raw) as UploadCheckpoint) : null;
  } catch {
    return null;
  }
}

export function saveCheckpoint(cp: UploadCheckpoint): void {
  localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(cp));
}

export function clearCheckpoint(): void {
  localStorage.removeItem(CHECKPOINT_KEY);
}

export interface ChunkedUploadOptions {
  endpoint: string;
  file: File;
  chunkSize?: number;
  onProgress?: (pct: number) => void;
  signal?: AbortSignal;
}

/**
 * Resumable chunked upload (tus-inspired PATCH chunks).
 * Server must implement offset resume. Live mode never calls this.
 */
export async function chunkedUpload({
  endpoint,
  file,
  chunkSize = 5 * 1024 * 1024,
  onProgress,
  signal,
}: ChunkedUploadOptions): Promise<string> {
  const existing = loadCheckpoint();
  let offset = existing?.fileName === file.name ? existing.offset : 0;
  const uploadId = existing?.uploadId ?? crypto.randomUUID();

  saveCheckpoint({ uploadId, fileName: file.name, offset, totalSize: file.size });

  while (offset < file.size) {
    if (signal?.aborted) throw new DOMException('Upload aborted', 'AbortError');

    const chunk = file.slice(offset, offset + chunkSize);
    const res = await fetch(`${endpoint}/${uploadId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/offset+octet-stream',
        'Upload-Offset': String(offset),
        'Upload-Length': String(file.size),
      },
      body: chunk,
      signal,
    });

    if (!res.ok) {
      throw new Error(`Upload failed at offset ${offset}: HTTP ${res.status}`);
    }

    const newOffset = Number(res.headers.get('Upload-Offset') ?? offset + chunk.size);
    offset = newOffset;
    saveCheckpoint({ uploadId, fileName: file.name, offset, totalSize: file.size });
    onProgress?.(Math.round((offset / file.size) * 100));
  }

  clearCheckpoint();
  return uploadId;
}

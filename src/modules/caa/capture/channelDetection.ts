import { MIN_ARRAY_CHANNELS, type SensingMode } from '../types';

export interface ChannelProbeResult {
  channelCount: number;
  mode: SensingMode;
  reason: string;
}

/**
 * Detect multichannel audio from getUserMedia stream.
 * Engineering assumption: channelCount appears in getSettings() when OS exposes array.
 * verify against current MDN MediaTrackSettings.
 */
export function probeAudioChannels(stream: MediaStream): ChannelProbeResult {
  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length === 0) {
    return {
      channelCount: 0,
      mode: 'B',
      reason: 'No audio track available. Showing room level only.',
    };
  }

  const track = audioTracks[0];
  const settings = track.getSettings();
  const reported = typeof settings.channelCount === 'number' ? settings.channelCount : null;

  if (reported !== null && reported >= MIN_ARRAY_CHANNELS) {
    return {
      channelCount: reported,
      mode: 'A',
      reason: `Microphone array detected (${reported} channels). Zone detection enabled.`,
    };
  }

  const fallback = reported ?? 1;
  return {
    channelCount: fallback,
    mode: 'B',
    reason:
      'Zone detection unavailable — this device has no microphone array. Showing room level only.',
  };
}

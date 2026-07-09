export { CaptureLayer, type CaptureLayerProps } from './capture/CaptureLayer';
export { useMediaCapture, type UseMediaCaptureReturn } from './capture/useMediaCapture';
export { negotiateRecorderMimeType } from './capture/codecNegotiation';
export { probeAudioChannels } from './capture/channelDetection';
export { mapMediaError } from './capture/mediaErrors';
export type {
  CAAConfig,
  CaptureUiState,
  SensingMode,
  VisionSubMode,
  ZoneActivityTuple,
  RoomLevelTuple,
  ZoneId,
} from './types';

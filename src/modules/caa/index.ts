export { CaptureLayer, type CaptureLayerProps } from './capture/CaptureLayer';
export { useMediaCapture, type UseMediaCaptureReturn } from './capture/useMediaCapture';
export { negotiateRecorderMimeType } from './capture/codecNegotiation';
export { probeAudioChannels } from './capture/channelDetection';
export { mapMediaError } from './capture/mediaErrors';
export { validateUploadFile } from './capture/uploadValidation';
export type {
  CAAConfig,
  CaptureUiState,
  ConsentArtifact,
  SensingMode,
  VisionSubMode,
  ZoneActivityTuple,
  RoomLevelTuple,
  ZoneId,
} from './types';

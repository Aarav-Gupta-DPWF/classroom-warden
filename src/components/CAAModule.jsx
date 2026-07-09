import { CaptureLayer } from '../modules/caa';

const caaConfig = {
  visionMode: 'landmark-free',
  consentArtifacts: [],
  analyticsOptIn: false,
  zoneCount: 4,
};

export default function CAAModule() {
  return (
    <div className="caa-module-wrap">
      <CaptureLayer config={caaConfig} />
    </div>
  );
}

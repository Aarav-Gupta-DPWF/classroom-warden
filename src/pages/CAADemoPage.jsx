import { CaptureLayer } from '../modules/caa';

const demoConfig = {
  visionMode: 'landmark-free',
  consentArtifacts: [],
  analyticsOptIn: false,
  zoneCount: 4,
};

/** Dev route wrapper — wire into App.jsx router when ready */
export default function CAADemoPage() {
  return (
    <main style={{ padding: 24, minHeight: '100vh', background: '#030508' }}>
      <CaptureLayer config={demoConfig} />
    </main>
  );
}

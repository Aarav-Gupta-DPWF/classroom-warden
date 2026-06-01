/**
 * Official Classroom Warden brand mark (three speakers + wordmark).
 * Asset: /public/classroom-warden-logo.png
 */
export default function ClassroomWardenLogo({ height = 48, className = '' }) {
  return (
    <img
      src="/classroom-warden-logo.png"
      alt="Classroom Warden"
      className={`cw-brand-logo ${className}`.trim()}
      height={height}
      width="auto"
      decoding="async"
      style={{ height, width: 'auto', objectFit: 'contain', display: 'block' }}
    />
  );
}

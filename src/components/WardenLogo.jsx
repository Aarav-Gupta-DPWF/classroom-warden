const LOGO_SRC = '/classroom-warden-logo.png';

/**
 * Classroom Warden brand logo (speakers + wordmark).
 * @param {number} height - rendered height in px (width scales automatically)
 */
export default function WardenLogo({ height = 40, className = '', alt = 'Classroom Warden' }) {
  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      className={`warden-logo ${className}`.trim()}
      height={height}
      width="auto"
      decoding="async"
      draggable={false}
    />
  );
}

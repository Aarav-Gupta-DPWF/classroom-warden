import { useId } from 'react';

/** Classroom Warden traffic-light mark (shared across landing + console). */
export default function TrafficLightLogo({ height = 58, className = '' }) {
  const uid = useId().replace(/:/g, '');
  const width = Math.round((height * 28) / 58);

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 28 58"
      fill="none"
      aria-hidden
    >
      <defs>
        <filter id={`${uid}-tlgr`}>
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${uid}-tlgy`}>
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${uid}-tlgg`}>
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`${uid}-tlHousing`} x1="0" y1="0" x2="0" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0D1929" />
          <stop offset="1" stopColor="#070D18" />
        </linearGradient>
      </defs>

      <rect
        x="2"
        y="1"
        width="24"
        height="56"
        rx="12"
        fill={`url(#${uid}-tlHousing)`}
        stroke="rgba(0,229,180,0.22)"
        strokeWidth="1.2"
      />
      <path
        d="M2 9 L2 1 L10 1"
        stroke="rgba(0,229,180,0.55)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 1 L26 1 L26 9"
        stroke="rgba(0,229,180,0.55)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 49 L2 57 L10 57"
        stroke="rgba(0,229,180,0.55)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 57 L26 57 L26 49"
        stroke="rgba(0,229,180,0.55)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="2" y="28" width="24" height="0.8" fill="rgba(0,229,180,0.12)" className="tl-scan" />

      <circle cx="14" cy="12" r="7" fill="rgba(255,71,87,0.12)" stroke="rgba(255,71,87,0.25)" strokeWidth="0.5" />
      <circle cx="14" cy="12" r="5.2" fill="#FF4757" className="tl-red" filter={`url(#${uid}-tlgr)`} />
      <circle cx="14" cy="29" r="7" fill="rgba(255,217,61,0.12)" stroke="rgba(255,217,61,0.25)" strokeWidth="0.5" />
      <circle cx="14" cy="29" r="5.2" fill="#FFD93D" className="tl-yellow" filter={`url(#${uid}-tlgy)`} />
      <circle cx="14" cy="46" r="7" fill="rgba(46,213,115,0.12)" stroke="rgba(46,213,115,0.25)" strokeWidth="0.5" />
      <circle cx="14" cy="46" r="5.2" fill="#2ED573" className="tl-green" filter={`url(#${uid}-tlgg)`} />

      <line x1="0" y1="12" x2="2" y2="12" stroke="rgba(255,71,87,0.5)" strokeWidth="0.9" />
      <circle cx="-1" cy="12" r="1.2" fill="rgba(255,71,87,0.6)" className="tl-dot-r" />
      <line x1="0" y1="29" x2="2" y2="29" stroke="rgba(255,217,61,0.5)" strokeWidth="0.9" />
      <circle cx="-1" cy="29" r="1.2" fill="rgba(255,217,61,0.6)" className="tl-dot-y" />
      <line x1="0" y1="46" x2="2" y2="46" stroke="rgba(46,213,115,0.5)" strokeWidth="0.9" />
      <circle cx="-1" cy="46" r="1.2" fill="rgba(46,213,115,0.6)" className="tl-dot-g" />
      <line x1="26" y1="12" x2="29" y2="12" stroke="rgba(255,71,87,0.5)" strokeWidth="0.9" />
      <circle cx="30" cy="12" r="1.2" fill="rgba(255,71,87,0.6)" className="tl-dot-r" />
      <line x1="26" y1="29" x2="29" y2="29" stroke="rgba(255,217,61,0.5)" strokeWidth="0.9" />
      <circle cx="30" cy="29" r="1.2" fill="rgba(255,217,61,0.6)" className="tl-dot-y" />
      <line x1="26" y1="46" x2="29" y2="46" stroke="rgba(46,213,115,0.5)" strokeWidth="0.9" />
      <circle cx="30" cy="46" r="1.2" fill="rgba(46,213,115,0.6)" className="tl-dot-g" />
    </svg>
  );
}

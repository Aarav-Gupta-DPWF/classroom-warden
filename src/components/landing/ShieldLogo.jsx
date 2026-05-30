export default function ShieldLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <path
        d="M16 2L6 6v9c0 6.2 4.3 11.9 10 13 5.7-1.1 10-6.8 10-13V6l-10-4z"
        fill="url(#shieldGrad)"
        fillOpacity="0.9"
      />
      <path
        d="M16 8v12M12 12h8"
        stroke="#060B18"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

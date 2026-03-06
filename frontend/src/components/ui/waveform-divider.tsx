export function WaveformDivider() {
  return (
    <div className="w-full overflow-hidden" style={{ height: "24px" }}>
      <svg
        viewBox="0 0 1440 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-gradient" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="20%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="80%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M0 12 Q 120 4, 240 12 T 480 12 T 720 12 T 960 12 T 1200 12 T 1440 12"
          stroke="url(#wave-gradient)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  );
}

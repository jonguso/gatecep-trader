export default function AIConfidenceRing({
  value = 75,
  size = 90
}) {
  const radius = 34;
  const stroke = 8;

  const normalizedRadius =
    radius - stroke / 2;

  const circumference =
    normalizedRadius * 2 * Math.PI;

  const offset =
    circumference -
    (value / 100) * circumference;

  function ringColor() {
    if (value >= 90) {
      return "#22d3ee";
    }

    if (value >= 75) {
      return "#22c55e";
    }

    if (value >= 60) {
      return "#eab308";
    }

    return "#ef4444";
  }

  function confidenceText() {
    if (value >= 90) {
      return "HIGH";
    }

    if (value >= 75) {
      return "GOOD";
    }

    if (value >= 60) {
      return "MEDIUM";
    }

    return "LOW";
  }

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        width: size,
        height: size
      }}
    >
      <div className="relative">
        <svg
          height={size}
          width={size}
          className="-rotate-90"
        >
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />

          <circle
            stroke={ringColor()}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset: offset,
              transition:
                "stroke-dashoffset 0.5s ease"
            }}
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-xl font-bold"
            style={{
              color: ringColor()
            }}
          >
            {value}%
          </div>

          <div className="text-[10px] text-slate-400 tracking-wide">
            {confidenceText()}
          </div>
        </div>
      </div>
    </div>
  );
}
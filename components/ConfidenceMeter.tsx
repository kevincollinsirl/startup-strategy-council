interface ConfidenceMeterProps {
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ConfidenceMeter({
  confidence,
  size = 'md',
}: ConfidenceMeterProps) {
  const color =
    confidence >= 70
      ? 'stroke-green-500'
      : confidence >= 40
      ? 'stroke-yellow-500'
      : 'stroke-red-500';

  const bgColor =
    confidence >= 70
      ? 'text-green-500'
      : confidence >= 40
      ? 'text-yellow-500'
      : 'text-red-500';

  const label =
    confidence >= 70
      ? 'High Confidence'
      : confidence >= 40
      ? 'Moderate Confidence'
      : 'Low Confidence';

  const sizes = {
    sm: { width: 60, stroke: 4, fontSize: 'text-sm' },
    md: { width: 100, stroke: 6, fontSize: 'text-xl' },
    lg: { width: 150, stroke: 8, fontSize: 'text-3xl' },
  };

  const { width, stroke, fontSize } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (confidence / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        {/* Background circle */}
        <svg
          className="transform -rotate-90"
          width={width}
          height={width}
        >
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-gray-800"
          />
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className={color}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${fontSize} ${bgColor}`}>
            {confidence}%
          </span>
        </div>
      </div>

      {/* Label */}
      <p className={`mt-2 text-sm ${bgColor}`}>{label}</p>
    </div>
  );
}

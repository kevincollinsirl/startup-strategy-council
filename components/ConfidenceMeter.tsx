interface ConfidenceMeterProps {
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ConfidenceMeter({
  confidence,
  size = 'md',
}: ConfidenceMeterProps) {
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
            className="text-muted"
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
            className="stroke-primary"
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${fontSize} text-foreground`}>
            {confidence}%
          </span>
        </div>
      </div>

      {/* Label */}
      <p className="mt-2 text-sm text-muted-foreground">Confidence</p>
    </div>
  );
}

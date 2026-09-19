'use client';

interface ConfidenceIndicatorProps {
  confidence: number; // 0 to 1
  label?: string;
  showBar?: boolean;
}

export default function ConfidenceIndicator({ confidence, label = 'Confidence', showBar = true }: ConfidenceIndicatorProps) {
  const pct = Math.round(confidence * 100);
  let color = 'text-[#16794A]';
  let barColor = 'bg-[#16794A]';

  if (confidence < 0.8) {
    color = 'text-[#B45309]';
    barColor = 'bg-[#B45309]';
  } else if (confidence < 0.6) {
    color = 'text-[#C2410C]';
    barColor = 'bg-[#C2410C]';
  }

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-[10px] font-semibold text-[#8E95A2] uppercase tracking-wider">{label}</span>}
      <span className={`text-[11px] font-bold font-mono ${color}`}>{pct}%</span>
      {showBar && (
        <div className="w-12 h-1.5 bg-[#E5E5E0] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

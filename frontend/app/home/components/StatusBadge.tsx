'use client';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, className = '', size = 'sm' }: StatusBadgeProps) {
  const norm = status.toUpperCase();
  let style = 'bg-[#F4F4F1] text-[#5F6673] border-[#E5E5E0]';

  if (norm.includes('IN') || norm.includes('VALIDATED') || norm.includes('CONFIRMED') || norm.includes('SYNCED')) {
    style = 'bg-[#E8F4EC] text-[#16794A] border-[#C6E5D6]';
  } else if (norm.includes('OUT') || norm.includes('SALE') || norm.includes('FLAGGED') || norm.includes('ERROR')) {
    style = 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]';
  } else if (norm.includes('READY') || norm.includes('REVIEW') || norm.includes('ACTIVE') || norm.includes('VOICE')) {
    style = 'bg-[#EEF2FF] text-[#2457FF] border-[#2457FF]/30';
  } else if (norm.includes('CLARIFICATION') || norm.includes('AMBIGUOUS') || norm.includes('PENDING') || norm.includes('ADJUSTMENT')) {
    style = 'bg-[#FEF8ED] text-[#B45309] border-[#FDE68A]';
  }

  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]';

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wider uppercase rounded border font-mono ${padding} ${style} ${className}`}
    >
      {status}
    </span>
  );
}

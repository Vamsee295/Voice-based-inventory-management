'use client';

import StatusBadge from './StatusBadge';

interface TransactionPreviewProps {
  operation: string;
  product: string;
  quantity: string;
  current: string;
  after: string;
  source: string;
  status: string;
}

export default function TransactionPreview({
  operation,
  product,
  quantity,
  current,
  after,
  source,
  status,
}: TransactionPreviewProps) {
  const isPositive = quantity.startsWith('+');

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden mb-3">
      {/* Header */}
      <div className="px-4 py-2 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-[#5F6673]">preview</span>
          <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#111318]">
            Transaction Preview
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8E95A2]">Pre-Commit Impact</span>
          <StatusBadge status={status} size="sm" />
        </div>
      </div>

      {/* Structured preview row */}
      <div className="p-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-3 bg-[#F9F9F7] border border-[#E5E5E0] rounded-md">
          {/* Operation & Product */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={operation} size="sm" />
              <span className="text-[10px] font-mono text-[#5F6673] bg-[#FFFFFF] border border-[#E5E5E0] px-1.5 py-0.2 rounded">
                Source: {source}
              </span>
            </div>
            <p className="text-[14px] font-bold text-[#111318] truncate">{product}</p>
          </div>

          {/* Balance Change Sequence */}
          <div className="flex items-center gap-3 shrink-0 bg-[#FFFFFF] border border-[#E5E5E0] px-3.5 py-2 rounded">
            <div className="text-right">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E95A2] block">Current</span>
              <span className="text-[12px] font-mono font-semibold text-[#5F6673]">{current}</span>
            </div>

            <div className="flex flex-col items-center px-1">
              <span className="material-symbols-outlined text-[14px] text-[#8E95A2]">arrow_forward</span>
              <span className={`text-[13px] font-bold font-mono ${isPositive ? 'text-[#16794A]' : 'text-[#C2410C]'}`}>
                {quantity}
              </span>
            </div>

            <div className="text-left pl-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E95A2] block">After</span>
              <span className="text-[13px] font-mono font-bold text-[#111318]">{after}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import StatusBadge from './StatusBadge';

interface InterpretationPanelProps {
  intent: string;
  intentLabel: string;
  product: string;
  quantity: number;
  unit: string;
  resolvedSkuName?: string;
}

export default function InterpretationPanel({
  intent,
  intentLabel,
  product,
  quantity,
  unit,
  resolvedSkuName,
}: InterpretationPanelProps) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden mb-3">
      {/* Header */}
      <div className="px-4 py-2 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-[#5F6673]">psychology</span>
          <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#111318]">
            VoiceMate Understood
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8E95A2] uppercase tracking-wider">Semantic Parse</span>
          <StatusBadge status={intentLabel} size="sm" />
        </div>
      </div>

      {/* Grid of understood semantic items */}
      <div className="p-3.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Intent Card */}
          <div className="bg-[#F9F9F7] border border-[#E5E5E0] rounded p-2.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E95A2] block mb-1">
              Detected Intent
            </span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[#16794A]">
                {intent === 'STOCK_IN' ? 'move_to_inbox' : intent === 'STOCK_OUT' ? 'outbox' : 'tune'}
              </span>
              <span className="text-[13px] font-bold text-[#111318]">{intentLabel}</span>
            </div>
          </div>

          {/* Product Card */}
          <div className="bg-[#F9F9F7] border border-[#E5E5E0] rounded p-2.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E95A2] block mb-1">
              Extracted Product
            </span>
            <p className="text-[13px] font-bold text-[#111318] truncate">{product}</p>
            {resolvedSkuName && (
              <p className="text-[10px] text-[#5F6673] truncate mt-0.5">{resolvedSkuName}</p>
            )}
          </div>

          {/* Quantity Card */}
          <div className="bg-[#F9F9F7] border border-[#E5E5E0] rounded p-2.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E95A2] block mb-1">
              Quantity
            </span>
            <p className="text-[16px] font-bold font-mono text-[#111318]">{quantity}</p>
          </div>

          {/* Unit Card */}
          <div className="bg-[#F9F9F7] border border-[#E5E5E0] rounded p-2.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E95A2] block mb-1">
              Trade Unit
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-bold text-[#2457FF]">{unit}</span>
              <span className="text-[9px] text-[#8E95A2] bg-[#FFFFFF] border border-[#E5E5E0] px-1 py-0.5 rounded">
                TUNE Standard
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

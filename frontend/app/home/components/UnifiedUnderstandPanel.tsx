'use client';

import StatusBadge from './StatusBadge';

interface UnifiedUnderstandPanelProps {
  phrase: string;
  language: string;
  confidence: number;
  category?: string;
  intent: string;
  intentLabel: string;
  product: string;
  quantity: number;
  unit: string;
  resolvedSkuName?: string;
}

export default function UnifiedUnderstandPanel({
  phrase,
  language,
  confidence,
  category = 'Voice Inward',
  intent,
  intentLabel,
  product,
  quantity,
  unit,
  resolvedSkuName,
}: UnifiedUnderstandPanelProps) {
  const pct = (confidence * 100).toFixed(1);
  const intentIcon =
    intent === 'STOCK_IN' ? 'move_to_inbox' : intent === 'STOCK_OUT' ? 'outbox' : 'tune';

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-md overflow-hidden mb-3">
      {/* Stage Header */}
      <div className="px-4 py-2 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] font-bold tracking-widest uppercase text-[#8E95A2] bg-[#FFFFFF] border border-[#E5E5E0] px-2 py-0.5 rounded-sm font-mono">
            02
          </span>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#111318]">
            UNDERSTAND
          </span>
          <span className="text-[10px] text-[#8E95A2] font-medium">
            · Natural Language Interpretation
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={category} size="sm" />
          <span className="text-[10px] text-[#5F6673] bg-[#FFFFFF] border border-[#E5E5E0] px-2 py-0.5 rounded font-mono">
            {language} · {pct}%
          </span>
        </div>
      </div>

      <div className="p-3.5 flex flex-col gap-3">
        {/* Transcript Row */}
        <div className="flex items-start gap-3 pb-3 border-b border-[#F0F0EB]">
          <div className="w-7 h-7 rounded bg-[#EEF2FF] border border-[#2457FF]/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[15px] text-[#2457FF]">mic</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase font-bold tracking-wider text-[#8E95A2] mb-0.5">
              VoiceMate Heard (Acoustic Buffer)
            </p>
            <p className="text-[15px] font-medium text-[#111318] italic tracking-tight leading-snug">
              &ldquo;{phrase}&rdquo;
            </p>
            {/* Acoustic Tokens */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-bold text-[#8E95A2] uppercase tracking-wider mr-0.5">
                Tokens:
              </span>
              {phrase
                .replace(/[.,]/g, '')
                .split(' ')
                .map((word, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono bg-[#F4F4F1] border border-[#E5E5E0] px-1.5 py-0.5 rounded text-[#111318]"
                  >
                    {word}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Semantic Parse Row */}
        <div>
          <p className="text-[9px] uppercase font-bold tracking-wider text-[#8E95A2] mb-2">
            Semantic Parse Result
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Intent */}
            <div className="bg-[#F9F9F7] border border-[#E5E5E0] rounded p-2.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E95A2] block mb-1">
                Intent
              </span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#16794A]">
                  {intentIcon}
                </span>
                <span className="text-[12px] font-bold text-[#111318] leading-tight">{intentLabel}</span>
              </div>
            </div>

            {/* Product */}
            <div className="bg-[#F9F9F7] border border-[#E5E5E0] rounded p-2.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E95A2] block mb-1">
                Product
              </span>
              <p className="text-[12px] font-bold text-[#111318] truncate">{product}</p>
              {resolvedSkuName && (
                <p className="text-[10px] text-[#5F6673] truncate mt-0.5">{resolvedSkuName}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="bg-[#F9F9F7] border border-[#E5E5E0] rounded p-2.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E95A2] block mb-1">
                Quantity
              </span>
              <p className="text-[16px] font-bold font-mono text-[#111318]">{quantity}</p>
            </div>

            {/* Trade Unit */}
            <div className="bg-[#F9F9F7] border border-[#E5E5E0] rounded p-2.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E95A2] block mb-1">
                Trade Unit
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-[#2457FF]">{unit}</span>
                <span className="text-[9px] text-[#8E95A2] bg-[#FFFFFF] border border-[#E5E5E0] px-1 py-0.5 rounded">
                  TUNE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

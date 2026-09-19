'use client';

import StatusBadge from './StatusBadge';

interface TranscriptPanelProps {
  phrase: string;
  language: string;
  confidence: number;
  category?: string;
}

export default function TranscriptPanel({
  phrase,
  language,
  confidence,
  category = 'Voice Inward',
}: TranscriptPanelProps) {
  const pct = (confidence * 100).toFixed(1);

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden mb-3">
      {/* Header */}
      <div className="px-4 py-2 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-[#5F6673]">record_voice_over</span>
          <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#111318]">
            Voice Transcript
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={category} size="sm" />
          <span className="text-[10px] text-[#5F6673] bg-[#FFFFFF] border border-[#E5E5E0] px-2 py-0.5 rounded font-mono">
            {language} · {pct}% confidence
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-[#EEF2FF] border border-[#2457FF]/20 flex items-center justify-center shrink-0 text-[#2457FF]">
            <span className="material-symbols-outlined text-[18px]">mic</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#8E95A2] mb-0.5">
              VoiceMate Heard (Acoustic Buffer)
            </p>
            <p className="text-[16px] font-medium text-[#111318] italic tracking-tight leading-snug">
              "{phrase}"
            </p>

            {/* Token decomposition */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-bold text-[#8E95A2] uppercase tracking-wider mr-1">
                Acoustic Tokens:
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
      </div>
    </div>
  );
}

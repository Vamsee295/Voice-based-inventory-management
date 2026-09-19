'use client';

import { useInventoryStore } from '../useInventoryStore';

export default function HumanConfirmationGate() {
  const { voice, confirmAndCommit, resetVoice } = useInventoryStore();
  const isVisible = voice.status === 'REVIEW';

  if (!isVisible) return null;

  const validEntities = voice.extractedEntities.filter((e) => e.status === 'Validated');

  return (
    <div className="bg-[#FFFFFF] border border-[#2457FF]/30 rounded-lg shadow-sm overflow-hidden mb-4">
      {/* Gate Header */}
      <div className="px-4 py-2.5 border-b border-[#2457FF]/20 bg-[#EEF2FF] flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px] text-[#2457FF]">verified_user</span>
        <span className="text-[11px] font-bold tracking-widest uppercase text-[#2457FF]">Human-in-the-Loop Confirmation Gate</span>
      </div>

      <div className="p-4">
        {/* Safety statement */}
        <p className="text-[12px] text-[#5F6673] mb-4 pb-4 border-b border-[#ECECE8] leading-relaxed">
          <span className="font-semibold text-[#111318]">VoiceMate guarantees strict ledger immutability.</span>{' '}
          AI proposals will never commit automatically to master tables without explicit operator verification.
          Review the interpretation below before applying it.
        </p>

        {/* Parsed action rows */}
        <div className="space-y-3 mb-4">
          {validEntities.map((entity) => (
            <div key={entity.id} className="flex items-center justify-between py-2.5 px-3 bg-[#F4F4F1] rounded border border-[#E5E5E0]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded border ${
                    entity.intent === 'STOCK_IN'
                      ? 'bg-[#E8F4EC] text-[#16794A] border-[#C6E5D6]'
                      : 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]'
                  }`}>
                    {entity.intent === 'STOCK_IN' ? 'Stock In' : 'Stock Out'}
                  </span>
                  <span className="text-[13px] font-semibold text-[#111318]">{entity.product?.name}</span>
                </div>
                <div className="text-[11px] text-[#5F6673]">
                  Current: <span className="font-mono font-semibold text-[#111318]">{entity.currentStock.toFixed(1)} {entity.normalizedUnit}</span>
                  <span className="mx-1.5 text-[#CCCCCC]">→</span>
                  Projected: <span className={`font-mono font-bold ${entity.intent === 'STOCK_IN' ? 'text-[#16794A]' : 'text-[#C2410C]'}`}>
                    {entity.projectedStock.toFixed(1)} {entity.normalizedUnit}
                  </span>
                </div>
              </div>
              <div className={`text-[20px] font-bold font-mono ${entity.intent === 'STOCK_IN' ? 'text-[#16794A]' : 'text-[#C2410C]'}`}>
                {entity.intent === 'STOCK_IN' ? '+' : '-'}{entity.normalizedDelta.toFixed(1)} {entity.normalizedUnit}
              </div>
            </div>
          ))}
        </div>

        {/* Meta row */}
        <div className="flex gap-6 mb-4 text-[11px] text-[#5F6673]">
          <div>
            <span className="font-semibold text-[#8E95A2] uppercase text-[9px] tracking-wider">Target Table</span>
            <p className="font-mono text-[#111318]">public.inventory_journal</p>
          </div>
          <div>
            <span className="font-semibold text-[#8E95A2] uppercase text-[9px] tracking-wider">Records</span>
            <p className="font-mono text-[#111318]">+{validEntities.length}</p>
          </div>
          <div>
            <span className="font-semibold text-[#8E95A2] uppercase text-[9px] tracking-wider">Author</span>
            <p className="text-[#111318]">Suresh R. (S.K.)</p>
          </div>
          <div>
            <span className="font-semibold text-[#8E95A2] uppercase text-[9px] tracking-wider">Source</span>
            <p suppressHydrationWarning className="text-[#111318]">Voice Console · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={confirmAndCommit}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2457FF] text-white text-[13px] font-semibold rounded hover:bg-[#003ED7] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">done_all</span>
            Confirm & Append to Master Ledger ({validEntities.length} item{validEntities.length !== 1 ? 's' : ''})
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F4F4F1] text-[#111318] text-[13px] font-semibold border border-[#E5E5E0] rounded hover:bg-[#EEEEEB] transition-colors">
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Edit Line Items
          </button>
          <button
            onClick={resetVoice}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FEF2ED] text-[#C2410C] text-[13px] font-semibold border border-[#F9CBBA] rounded hover:bg-[#FDE8E0] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            Discard Buffer
          </button>
        </div>
      </div>
    </div>
  );
}

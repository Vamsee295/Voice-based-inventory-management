'use client';

import { useInventoryStore } from '../useInventoryStore';

const intentBadge = (type: string) => {
  if (type === 'STOCK_IN') return 'bg-[#E8F4EC] text-[#16794A] border-[#C6E5D6]';
  if (type === 'STOCK_OUT') return 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]';
  return 'bg-[#F4F4F1] text-[#5F6673] border-[#E5E5E0]';
};

const intentLabel = (type: string) => {
  if (type === 'STOCK_IN') return 'Stock In';
  if (type === 'STOCK_OUT') return 'Stock Out';
  return 'Adjustment';
};

const statusBadge = (status: string) => {
  if (status === 'Validated') return 'bg-[#E8F4EC] text-[#16794A]';
  if (status === 'Normalised') return 'bg-[#EEF2FF] text-[#2457FF]';
  if (status === 'Ambiguous') return 'bg-[#FEF8ED] text-[#B45309]';
  return 'bg-[#FEF2ED] text-[#C2410C]';
};

export default function EntityExtractionTable() {
  const entities = useInventoryStore((s) => s.voice.extractedEntities);
  const voiceStatus = useInventoryStore((s) => s.voice.status);

  const isVisible = entities.length > 0 && !['IDLE', 'LISTENING', 'TRANSCRIBING'].includes(voiceStatus);

  if (!isVisible) return null;

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden mb-4">
      <div className="px-4 py-2.5 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-[#5F6673]">table_chart</span>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#111318]">Deterministic Entity Extraction (TUNE Engine)</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#5F6673]">
          <span className="font-bold text-[#2457FF]">{entities.length} Action{entities.length !== 1 ? 's' : ''}</span>
          <span>Pending Confirmation</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F4F1] border-b border-[#ECECE8]">
              <th className="px-3 py-2 text-[9px] font-bold text-[#8E95A2] uppercase tracking-widest whitespace-nowrap">Parsed / Master SKU</th>
              <th className="px-3 py-2 text-[9px] font-bold text-[#8E95A2] uppercase tracking-widest whitespace-nowrap">Raw Phonics</th>
              <th className="px-3 py-2 text-[9px] font-bold text-[#8E95A2] uppercase tracking-widest whitespace-nowrap">TUNE Unit Ratio</th>
              <th className="px-3 py-2 text-[9px] font-bold text-[#8E95A2] uppercase tracking-widest whitespace-nowrap">Physical Delta</th>
              <th className="px-3 py-2 text-[9px] font-bold text-[#8E95A2] uppercase tracking-widest whitespace-nowrap">Pre → Projected</th>
              <th className="px-3 py-2 text-[9px] font-bold text-[#8E95A2] uppercase tracking-widest whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0EB]">
            {entities.map((entity) => (
              <tr key={entity.id} className="hover:bg-[#F9F9F7] transition-colors">
                <td className="px-3 py-3 align-top">
                  <div className="font-semibold text-[13px] text-[#111318]">
                    {entity.product?.name ?? <span className="text-[#C2410C] italic">Unresolved</span>}
                  </div>
                  {entity.product && (
                    <div className="text-[10px] text-[#8E95A2] mt-0.5">{entity.product.vernacularName}</div>
                  )}
                  <div className="mt-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${intentBadge(entity.intent)}`}>
                      {intentLabel(entity.intent)}
                    </span>
                    <span className="ml-1 text-[9px] font-semibold text-[#8E95A2]">
                      {(entity.intentConfidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 align-top">
                  <div className="text-[12px] text-[#111318]">{entity.rawQuantity} {entity.rawUnit}</div>
                  {entity.rawPhonics && (
                    <div className="text-[10px] text-[#8E95A2] mt-0.5 italic">{entity.rawPhonics}</div>
                  )}
                </td>
                <td className="px-3 py-3 align-top">
                  <div className="text-[11px] font-semibold text-[#111318] font-mono">{entity.tuneRatio}</div>
                  <div className="text-[9px] text-[#8E95A2] mt-0.5">Indian Standard</div>
                </td>
                <td className="px-3 py-3 align-top">
                  <span className={`text-[14px] font-bold font-mono ${entity.intent === 'STOCK_IN' ? 'text-[#16794A]' : 'text-[#C2410C]'}`}>
                    {entity.intent === 'STOCK_IN' ? '+' : '-'}{entity.normalizedDelta.toFixed(2)} {entity.normalizedUnit}
                  </span>
                </td>
                <td className="px-3 py-3 align-top">
                  <div className="text-[11px] font-mono text-[#111318]">
                    <span>{entity.currentStock.toFixed(2)}</span>
                    <span className="text-[#8E95A2] mx-1">→</span>
                    <span className={`font-bold ${entity.intent === 'STOCK_IN' ? 'text-[#16794A]' : 'text-[#C2410C]'}`}>
                      {entity.projectedStock.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-[#8E95A2] ml-0.5">{entity.normalizedUnit}</span>
                  </div>
                </td>
                <td className="px-3 py-3 align-top">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${statusBadge(entity.status)}`}>
                    {entity.status}
                  </span>
                  <div className="text-[9px] text-[#8E95A2] mt-0.5">
                    {(entity.entityConfidence * 100).toFixed(0)}% match
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Validation note */}
      <div className="px-4 py-2 border-t border-[#ECECE8] bg-[#F9F9F7]">
        <p className="text-[10px] text-[#8E95A2]">
          ⓘ Rule Verification: Exact SKU matches resolved with high spatial score calibration. TUNE ratios drawn from business unit configuration.
        </p>
      </div>
    </div>
  );
}

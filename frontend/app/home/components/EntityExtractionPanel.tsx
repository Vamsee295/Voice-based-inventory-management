'use client';

import { DemoEntity } from '../demoData';
import StatusBadge from './StatusBadge';

interface EntityExtractionPanelProps {
  entities: DemoEntity[];
}

export default function EntityExtractionPanel({ entities }: EntityExtractionPanelProps) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden mb-3">
      {/* Header */}
      <div className="px-4 py-2 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-[#5F6673]">table_chart</span>
          <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#111318]">
            Deterministic Entity Extraction
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8E95A2]">Unit Normalization Engine (TUNE)</span>
          <span className="text-[10px] font-bold text-[#16794A] bg-[#E8F4EC] border border-[#C6E5D6] px-1.5 py-0.2 rounded font-mono">
            {entities.length} Extracted
          </span>
        </div>
      </div>

      {/* Operational Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#ECECE8] bg-[#FAFAF8] text-[9px] font-bold uppercase tracking-wider text-[#8E95A2]">
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Quantity</th>
              <th className="px-3 py-2">Unit</th>
              <th className="px-3 py-2">Normalized</th>
              <th className="px-3 py-2">Current Stock</th>
              <th className="px-3 py-2">Projected Stock</th>
              <th className="px-3 py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0EB] text-[12px]">
            {entities.map((ent) => (
              <tr key={ent.id} className="hover:bg-[#F9F9F7] transition-colors">
                <td className="px-3 py-2.5">
                  <div className="font-semibold text-[#111318]">{ent.product}</div>
                  <div className="text-[10px] font-mono text-[#8E95A2]">{ent.sku}</div>
                </td>
                <td className="px-3 py-2.5 font-bold font-mono text-[#111318]">
                  {ent.quantity}
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-[#2457FF] font-medium bg-[#EEF2FF] border border-[#2457FF]/20 px-1.5 py-0.5 rounded text-[11px]">
                    {ent.unit}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-bold font-mono text-[#111318]">
                  {ent.normalized}
                  {ent.unitConversionNote && (
                    <div className="text-[9px] text-[#8E95A2] font-normal">{ent.unitConversionNote}</div>
                  )}
                </td>
                <td className="px-3 py-2.5 font-mono text-[#5F6673]">
                  {ent.currentStock}
                </td>
                <td className="px-3 py-2.5 font-mono font-bold text-[#16794A]">
                  {ent.projectedStock}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <StatusBadge status={ent.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

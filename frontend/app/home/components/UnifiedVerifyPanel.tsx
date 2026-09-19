'use client';

import { DemoEntity } from '../demoData';
import StatusBadge from './StatusBadge';

interface UnifiedVerifyPanelProps {
  entities: DemoEntity[];
  operation: string;
  product: string;
  quantity: string;
  current: string;
  after: string;
  source: string;
  status: string;
}

export default function UnifiedVerifyPanel({
  entities,
  operation,
  product,
  quantity,
  current,
  after,
  source,
  status,
}: UnifiedVerifyPanelProps) {
  const isPositive = quantity.startsWith('+');
  const isMultiItem = entities.length > 1;

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-md overflow-hidden mb-3">
      {/* Stage Header */}
      <div className="px-4 py-2 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] font-bold tracking-widest uppercase text-[#8E95A2] bg-[#FFFFFF] border border-[#E5E5E0] px-2 py-0.5 rounded-sm font-mono">
            03
          </span>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#111318]">
            VERIFY
          </span>
          <span className="text-[10px] text-[#8E95A2] font-medium">
            · Inventory Impact Preview
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8E95A2]">TUNE Normalization</span>
          <span className="text-[10px] font-bold text-[#16794A] bg-[#E8F4EC] border border-[#C6E5D6] px-1.5 py-0.5 rounded font-mono">
            {entities.length} item{entities.length !== 1 ? 's' : ''} extracted
          </span>
        </div>
      </div>

      {/* Entity Extraction Table */}
      <div className="overflow-x-auto border-b border-[#F0F0EB]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#ECECE8] bg-[#FAFAF8] text-[9px] font-bold uppercase tracking-wider text-[#8E95A2]">
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Ingested</th>
              <th className="px-3 py-2">TUNE Conversion</th>
              <th className="px-3 py-2">Normalized</th>
              <th className="px-3 py-2">Current → Projected</th>
              <th className="px-3 py-2 text-right">Validation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0EB] text-[12px]">
            {entities.map((ent) => {
              const isPositiveRow = ent.deltaValue > 0;
              return (
                <tr key={ent.id} className="hover:bg-[#F9F9F7] transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-[#111318]">{ent.product}</div>
                    <div className="text-[10px] font-mono text-[#8E95A2]">{ent.sku}</div>
                  </td>
                  <td className="px-3 py-2.5 font-bold font-mono text-[#111318]">
                    {ent.quantity}{' '}
                    <span className="text-[10px] text-[#2457FF] font-medium bg-[#EEF2FF] border border-[#2457FF]/20 px-1.5 py-0.5 rounded ml-1">
                      {ent.unit}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[11px] text-[#5F6673]">
                    {ent.unitConversionNote ?? '—'}
                  </td>
                  <td className="px-3 py-2.5 font-bold font-mono text-[#111318]">
                    <span className={isPositiveRow ? 'text-[#16794A]' : 'text-[#C2410C]'}>
                      {ent.deltaDisplay}
                    </span>
                    <div className="text-[10px] text-[#8E95A2] font-normal font-sans">
                      {ent.normalized}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="font-mono text-[#5F6673]">{ent.currentStock}</span>
                      <span className="material-symbols-outlined text-[12px] text-[#8E95A2]">
                        arrow_forward
                      </span>
                      <span className="font-mono font-bold text-[#16794A]">{ent.projectedStock}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <StatusBadge status={ent.status} size="sm" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Transaction Summary Strip */}
      <div className="px-3.5 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#FAFAF8]">
        <div className="flex items-center gap-3">
          <StatusBadge status={operation} size="sm" />
          <span className="text-[11px] font-semibold text-[#111318] truncate">{isMultiItem ? product : product}</span>
          <span className="text-[10px] font-mono text-[#5F6673] bg-[#FFFFFF] border border-[#E5E5E0] px-1.5 py-0.5 rounded">
            Source: {source}
          </span>
        </div>
        {!isMultiItem && (
          <div className="flex items-center gap-2.5 bg-[#FFFFFF] border border-[#E5E5E0] px-3 py-1.5 rounded shrink-0">
            <div className="text-right">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E95A2] block">
                Current
              </span>
              <span className="text-[12px] font-mono font-semibold text-[#5F6673]">{current}</span>
            </div>
            <div className="flex flex-col items-center px-1">
              <span className="material-symbols-outlined text-[13px] text-[#8E95A2]">
                arrow_forward
              </span>
              <span
                className={`text-[12px] font-bold font-mono ${
                  isPositive ? 'text-[#16794A]' : 'text-[#C2410C]'
                }`}
              >
                {quantity}
              </span>
            </div>
            <div className="text-left pl-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E95A2] block">
                After
              </span>
              <span className="text-[13px] font-mono font-bold text-[#111318]">{after}</span>
            </div>
          </div>
        )}
        <StatusBadge status={status} size="sm" />
      </div>
    </div>
  );
}

'use client';

import { useInventory } from '../../../lib/inventory/hooks/useInventory';

const formatTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? iso
      : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
};

const typeBadge = (type: string) => {
  if (type === 'STOCK_IN') return 'bg-[#E8F4EC] text-[#16794A] border-[#C6E5D6]';
  if (type === 'STOCK_OUT') return 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]';
  return 'bg-[#FEF8ED] text-[#B45309] border-[#FDE68A]';
};

const typeLabel = (type: string) => {
  if (type === 'STOCK_IN') return 'Inward';
  if (type === 'STOCK_OUT') return 'Sale / Out';
  return 'Adjustment';
};

export default function ShiftJournalStream() {
  const { transactions } = useInventory();
  const recent = transactions.slice(0, 8);

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden mb-4">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-[#5F6673]">receipt_long</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#111318]">
            Shift Journal Activity Stream
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-semibold text-[#5F6673]">Shift 1 (Active)</span>
          <span className="text-[9px] font-bold font-mono text-[#16794A] bg-[#E8F4EC] px-1 py-0.2 rounded border border-[#C6E5D6]">
            {transactions.length} Records
          </span>
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-[#F0F0EB]">
        {recent.map((tx) => {
          const isPositive =
            tx.type === 'STOCK_IN' ||
            (tx.type === 'ADJUSTMENT' && tx.newStock >= tx.previousStock);
          const deltaVal =
            tx.type === 'STOCK_IN'
              ? tx.normalizedQuantity
              : tx.type === 'STOCK_OUT'
              ? -tx.normalizedQuantity
              : tx.newStock - tx.previousStock;

          return (
            <div key={tx.id} className="flex items-start gap-3 px-3 py-2.5 hover:bg-[#F9F9F7] transition-colors">
              <div
                suppressHydrationWarning
                className="text-[10px] font-semibold text-[#8E95A2] tabular-nums shrink-0 pt-0.5 w-12"
              >
                {formatTime(tx.createdAt)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`text-[9px] font-bold tracking-wider uppercase px-1 py-0.2 rounded border ${typeBadge(
                      tx.type
                    )}`}
                  >
                    {typeLabel(tx.type)}
                  </span>
                  <span className="text-[9px] font-semibold text-[#5F6673] border border-[#E5E5E0] px-1 py-0.2 rounded bg-[#FFFFFF]">
                    {tx.source}
                  </span>
                </div>
                <p className="text-[12px] font-semibold text-[#111318] truncate">{tx.productName}</p>
                {tx.note && <p className="text-[10px] text-[#8E95A2] italic truncate">{tx.note}</p>}
                {tx.createdBy && (
                  <p className="text-[9px] text-[#8E95A2]">Confirmed by {tx.createdBy}</p>
                )}
              </div>
              <div
                className={`text-[12px] font-bold font-mono shrink-0 ${
                  isPositive ? 'text-[#16794A]' : 'text-[#C2410C]'
                }`}
              >
                {deltaVal >= 0 ? '+' : ''}
                {deltaVal} {tx.normalizedUnit}
              </div>
            </div>
          );
        })}
        {recent.length === 0 && (
          <div className="px-3 py-8 text-center text-[12px] text-[#8E95A2]">
            No transactions recorded yet.
          </div>
        )}
      </div>

      {transactions.length > 8 && (
        <div className="px-3 py-2 border-t border-[#ECECE8] bg-[#F4F4F1]">
          <span className="text-[10px] font-semibold text-[#5F6673] w-full block text-center">
            Showing latest 8 of {transactions.length} shift entries
          </span>
        </div>
      )}
    </div>
  );
}

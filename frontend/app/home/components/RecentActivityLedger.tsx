'use client';

import { useInventoryStore } from '../useInventoryStore';

export default function RecentActivityLedger() {
  const transactions = useInventoryStore(state => state.transactions);
  
  // Show only last 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="px-4 py-3 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-[#111318] uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-[#5F6673]">receipt_long</span>
          Recent Activity
        </h3>
        <button className="text-[11px] font-semibold text-[#2457FF] hover:underline uppercase tracking-wider">
          View All
        </button>
      </div>
      
      <div className="divide-y divide-[#ECECE8]">
        {recentTransactions.map((tx) => (
          <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-[#F0F0EB] transition-colors">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span suppressHydrationWarning className="text-[11px] font-semibold text-[#5F6673] tabular-nums">{formatTime(tx.timestamp)}</span>
                <span className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded uppercase
                  ${tx.type === 'STOCK_IN' ? 'bg-[#E8F4EC] text-[#16794A]' : 
                    tx.type === 'STOCK_OUT' ? 'bg-[#FEF2ED] text-[#C2410C]' : 
                    'bg-[#F4F4F1] text-[#5F6673] border border-[#E5E5E0]'}`}
                >
                  {tx.type.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-semibold text-[#5F6673] border border-[#E5E5E0] px-1.5 py-0.5 rounded-sm bg-[#FFFFFF]">
                  {tx.source}
                </span>
              </div>
              <span className="text-[14px] font-medium text-[#111318]">{tx.productName}</span>
              {tx.note && <span className="text-[12px] text-[#5F6673] mt-0.5 italic">"{tx.note}"</span>}
            </div>
            
            <div className={`text-[16px] font-bold tabular-nums ${tx.type === 'STOCK_IN' ? 'text-[#16794A]' : tx.type === 'STOCK_OUT' ? 'text-[#C2410C]' : 'text-[#111318]'}`}>
              {tx.type === 'STOCK_IN' ? '+' : tx.type === 'STOCK_OUT' ? '-' : ''}{tx.delta}
            </div>
          </div>
        ))}
        {recentTransactions.length === 0 && (
          <div className="p-8 text-center text-[13px] text-[#5F6673]">
            No recent activity today.
          </div>
        )}
      </div>
    </div>
  );
}

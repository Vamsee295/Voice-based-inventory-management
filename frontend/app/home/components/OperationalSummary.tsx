'use client';

import { useInventoryStore } from '../useInventoryStore';

export default function OperationalSummary() {
  const products = useInventoryStore(state => state.products);
  const transactions = useInventoryStore(state => state.transactions);

  const needsAttention = products.filter(p => p.currentStock <= p.reorderLevel || (p.expiryAlert && p.expiryAlert.daysLeft <= 2)).length;
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayTxCount = transactions.filter(t => new Date(t.timestamp) >= startOfDay).length;
  const expiringCount = products.filter(p => p.expiryAlert && p.expiryAlert.daysLeft <= 2).length;

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg p-4 shadow-sm flex flex-col justify-center">
        <span className="text-[12px] font-semibold tracking-widest uppercase text-[#5F6673] mb-1">Needs Attention</span>
        <span className="text-[24px] font-bold text-[#111318]">{needsAttention}</span>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg p-4 shadow-sm flex flex-col justify-center">
        <span className="text-[12px] font-semibold tracking-widest uppercase text-[#5F6673] mb-1">Tx Today</span>
        <span className="text-[24px] font-bold text-[#111318]">{todayTxCount}</span>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg p-4 shadow-sm flex flex-col justify-center">
        <span className="text-[12px] font-semibold tracking-widest uppercase text-[#5F6673] mb-1">Expiring Soon</span>
        <span className="text-[24px] font-bold text-[#111318]">{expiringCount}</span>
      </div>
    </div>
  );
}


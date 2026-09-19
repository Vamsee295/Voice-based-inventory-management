'use client';

import React from 'react';
import { InventoryBatch } from '../../../lib/inventory/models/batch';
import { ExpiryService } from '../../../lib/alerts/expiryService';

interface ExpiryQueueProps {
  batches: InventoryBatch[];
  onReviewBatch: (batch: InventoryBatch) => void;
}

export default function ExpiryQueue({ batches, onReviewBatch }: ExpiryQueueProps) {
  if (batches.length === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg p-8 text-center shadow-sm">
        <span className="material-symbols-outlined text-[32px] text-[#D6D6D0] mb-2">
          inventory_2
        </span>
        <h3 className="text-[14px] font-bold text-[#111318] mb-1">No batches found</h3>
        <p className="text-[12px] text-[#8E95A2]">Try adjusting your filters or search term.</p>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'EXPIRED':
        return 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]';
      case 'EXPIRING_TODAY':
        return 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]';
      case 'EXPIRING_SOON':
        return 'bg-[#FFF4E5] text-[#B45309] border-[#FDE68A]';
      case 'UPCOMING':
        return 'bg-[#F0F4FF] text-[#2457FF] border-[#C7D6FF]';
      case 'SAFE':
        return 'bg-[#EDF7F2] text-[#16794A] border-[#C3E4D1]';
      default:
        return 'bg-[#F4F4F1] text-[#5F6673] border-[#E5E5E0]';
    }
  };

  const renderShelfClock = (days: number) => {
    // Max days for visualization scale
    const MAX_DAYS = 30;
    const boundedDays = Math.max(0, Math.min(days, MAX_DAYS));
    const percentage = (boundedDays / MAX_DAYS) * 100;
    
    let colorClass = 'bg-[#16794A]';
    if (days < 0) colorClass = 'bg-[#C2410C]';
    else if (days === 0) colorClass = 'bg-[#C2410C]';
    else if (days <= 3) colorClass = 'bg-[#B45309]';
    else if (days <= 7) colorClass = 'bg-[#2457FF]';

    return (
      <div className="w-24 h-2 bg-[#E5E5E0] rounded-full overflow-hidden mt-1">
        <div 
          className={`h-full ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="px-4 py-3 border-b border-[#ECECE8] bg-[#F4F4F1]">
        <h2 className="text-[12px] font-bold text-[#111318] tracking-widest uppercase">
          Attention Queue
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9F9F7] border-b border-[#E5E5E0]">
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Product & SKU</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Batch & Quantity</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Expiry Date</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Shelf Clock</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Status</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0EB]">
            {batches.map((batch) => {
              const status = ExpiryService.getStatus(batch.expiryDate);
              const days = ExpiryService.getDaysRemaining(batch.expiryDate);
              
              return (
                <tr key={batch.id} className="hover:bg-[#F9F9F7] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-semibold text-[#111318]">{batch.productName}</span>
                      <span className="text-[10px] font-mono text-[#8E95A2]">{batch.productSku}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-mono text-[#5F6673]">{batch.id}</span>
                      <span className="text-[11px] font-bold text-[#111318]">
                        {batch.quantity} <span className="text-[9px] font-normal text-[#8E95A2] uppercase">{batch.unit}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-medium text-[#111318]">
                      {new Date(batch.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-bold ${days <= 0 ? 'text-[#C2410C]' : 'text-[#111318]'}`}>
                        {days < 0 ? `${Math.abs(days)} days ago` : days === 0 ? 'Today' : `${days} days remaining`}
                      </span>
                      {renderShelfClock(days)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${getStatusStyle(status)}`}
                    >
                      {status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onReviewBatch(batch)}
                      className="text-[10px] font-bold text-[#2457FF] hover:bg-[#EEF2FF] border border-[#2457FF] px-3 py-1 rounded transition-colors uppercase tracking-wider"
                    >
                      Review Batch
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

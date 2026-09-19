'use client';

import { useState, useEffect } from 'react';
import { useInventory } from '../../../lib/inventory/hooks/useInventory';
import { StockAlertService, AlertPriority } from '../../../lib/alerts/stockAlertService';
import { ReorderService } from '../../../lib/alerts/reorderService';
import { ExpiryService } from '../../../lib/alerts/expiryService';

export default function NeedsAttention() {
  const { products } = useInventory();
  const [attentionItems, setAttentionItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      const items: Array<{
        id: string;
        name: string;
        type: 'LOW_STOCK' | 'EXPIRY' | 'CRITICAL_STOCK';
        detail: string;
        threshold: string;
        actionText: string;
        priority: AlertPriority;
      }> = [];

      products.forEach((p) => {
        const alertPriority = StockAlertService.getPriority(p);
        if (alertPriority !== 'NORMAL') {
          const suggestedReorder = ReorderService.getSuggestedReorderQuantity(p);
          items.push({
            id: `low-${p.id}`,
            name: p.name,
            type: alertPriority === 'CRITICAL' ? 'CRITICAL_STOCK' : 'LOW_STOCK',
            detail: `${p.currentStock} ${p.baseUnit} remaining`,
            threshold: `Reorder Level: ${p.reorderLevel} ${p.baseUnit}`,
            actionText: `Reorder ${suggestedReorder} ${p.baseUnit}`,
            priority: alertPriority,
          });
        }
      });

      const expiryBatches = await ExpiryService.getBatchesRequiringAttention();
      
      expiryBatches.forEach(batch => {
        const status = ExpiryService.getStatus(batch.expiryDate);
        const days = ExpiryService.getDaysRemaining(batch.expiryDate);
        
        let priority: AlertPriority = 'LOW';
        if (status === 'EXPIRED' || status === 'EXPIRING_TODAY') priority = 'CRITICAL';
        
        items.push({
          id: `exp-${batch.id}`,
          name: batch.productName,
          type: 'EXPIRY',
          detail: days < 0 ? 'Expired' : days === 0 ? 'Expires today' : `Expires in ${days} day${days !== 1 ? 's' : ''}`,
          threshold: `Batch: ${batch.id}`,
          actionText: 'Review Batch',
          priority,
        });
      });

      items.sort((a, b) => {
        if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1;
        if (a.priority !== 'CRITICAL' && b.priority === 'CRITICAL') return 1;
        return 0;
      });

      setAttentionItems(items);
    };

    fetchItems();
  }, [products]);

  if (attentionItems.length === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden mb-4 p-3 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[#16794A] text-[11px] font-bold">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          All Stocks Healthy
        </div>
        <p className="text-[10px] text-[#8E95A2] mt-0.5">No items below reorder level or near expiry</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden mb-4">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-[#C2410C]">warning</span>
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#111318]">
            Needs Attention
          </h3>
        </div>
        <span className="text-[9px] font-bold text-[#C2410C] bg-[#FEF2ED] border border-[#F9CBBA] px-1.5 py-0.2 rounded font-mono">
          {attentionItems.length} Alerts
        </span>
      </div>

      {/* Items List */}
      <div className="divide-y divide-[#F0F0EB]">
        {attentionItems.slice(0, 4).map((item) => (
          <div key={item.id} className="p-2.5 hover:bg-[#F9F9F7] transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-[11px] font-semibold text-[#111318] truncate">
                {item.name}
              </span>
              <span
                className={`text-[8px] font-bold tracking-wider uppercase px-1 py-0.2 rounded shrink-0 border ${
                  item.type === 'EXPIRY'
                    ? 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]'
                    : item.type === 'CRITICAL_STOCK'
                    ? 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]'
                    : 'bg-[#FEF8ED] text-[#B45309] border-[#FDE68A]'
                }`}
              >
                {item.type === 'EXPIRY' ? 'Shelf Clock' : item.type === 'CRITICAL_STOCK' ? 'Critical Stock' : 'Low Stock'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#5F6673]">
              <span className="truncate">
                {item.detail} · <span className="text-[#8E95A2]">{item.threshold}</span>
              </span>
              <button className="text-[9px] font-bold text-[#2457FF] hover:underline uppercase tracking-wider shrink-0 ml-1">
                {item.actionText} →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

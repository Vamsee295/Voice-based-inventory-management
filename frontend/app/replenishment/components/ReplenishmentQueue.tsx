'use client';

import React from 'react';
import { Product } from '../../../lib/inventory/models/product';

export interface QueueItem {
  product: Product;
  priority: 'CRITICAL' | 'LOW';
  suggestedQty: number;
}

interface ReplenishmentQueueProps {
  items: QueueItem[];
  onReviewReorder: (item: QueueItem) => void;
}

export default function ReplenishmentQueue({ items, onReviewReorder }: ReplenishmentQueueProps) {
  if (items.length === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg p-8 text-center shadow-sm">
        <span className="material-symbols-outlined text-[32px] text-[#16794A] mb-2">
          check_circle
        </span>
        <h3 className="text-[14px] font-bold text-[#111318] mb-1">No replenishment required</h3>
        <p className="text-[12px] text-[#8E95A2]">All products are above their reorder levels.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="px-4 py-3 border-b border-[#ECECE8] bg-[#F4F4F1]">
        <h2 className="text-[12px] font-bold text-[#111318] tracking-widest uppercase">
          Replenishment Queue
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9F9F7] border-b border-[#E5E5E0]">
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Product</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Current</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Reorder Level</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Suggested</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Priority</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0EB]">
            {items.map((item) => (
              <tr key={item.product.id} className="hover:bg-[#F9F9F7] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-semibold text-[#111318]">{item.product.name}</span>
                    <span className="text-[10px] font-mono text-[#8E95A2]">{item.product.sku}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[12px] font-bold text-[#111318]">
                    {item.product.currentStock} <span className="text-[10px] font-normal text-[#8E95A2]">{item.product.baseUnit}</span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[12px] text-[#5F6673]">
                    {item.product.reorderLevel} <span className="text-[10px]">{item.product.baseUnit}</span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[12px] font-bold text-[#2457FF]">
                    {item.suggestedQty} <span className="text-[10px] font-normal">{item.product.baseUnit}</span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${
                      item.priority === 'CRITICAL'
                        ? 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]'
                        : 'bg-[#FEF8ED] text-[#B45309] border-[#FDE68A]'
                    }`}
                  >
                    {item.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onReviewReorder(item)}
                    className="text-[10px] font-bold text-[#2457FF] hover:bg-[#EEF2FF] border border-[#2457FF] px-3 py-1 rounded transition-colors uppercase tracking-wider"
                  >
                    Review Reorder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

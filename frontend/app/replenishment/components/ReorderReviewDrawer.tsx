'use client';

import React, { useState, useEffect } from 'react';
import { QueueItem } from './ReplenishmentQueue';

interface ReorderReviewDrawerProps {
  item: QueueItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateReorder: (productId: string, quantity: number) => Promise<void>;
}

export default function ReorderReviewDrawer({
  item,
  isOpen,
  onClose,
  onCreateReorder,
}: ReorderReviewDrawerProps) {
  const [editQty, setEditQty] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setEditQty(item.suggestedQty);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleCreate = async () => {
    if (editQty <= 0) return;
    setIsSubmitting(true);
    try {
      await onCreateReorder(item.product.id, editQty);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-[#111318]/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-[400px] bg-[#FFFFFF] shadow-2xl z-50 flex flex-col border-l border-[#E5E5E0] transform transition-transform">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E5E0] flex items-center justify-between bg-[#F9F9F7]">
          <div>
            <h2 className="text-[14px] font-bold text-[#111318] tracking-tight">Reorder Review</h2>
            <p className="text-[10px] text-[#8E95A2] uppercase tracking-widest mt-0.5">
              Confirm Replenishment
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E95A2] hover:text-[#111318] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-6">
            <h3 className="text-[14px] font-bold text-[#111318]">{item.product.name}</h3>
            <p className="text-[11px] font-mono text-[#5F6673]">{item.product.sku}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#F9F9F7] border border-[#E5E5E0] p-3 rounded-md">
              <p className="text-[9px] font-bold text-[#8E95A2] uppercase tracking-widest mb-1">
                Current Stock
              </p>
              <p className="text-[14px] font-bold text-[#111318]">
                {item.product.currentStock}{' '}
                <span className="text-[11px] font-normal text-[#5F6673]">{item.product.baseUnit}</span>
              </p>
            </div>
            <div className="bg-[#F9F9F7] border border-[#E5E5E0] p-3 rounded-md">
              <p className="text-[9px] font-bold text-[#8E95A2] uppercase tracking-widest mb-1">
                Reorder Level
              </p>
              <p className="text-[14px] font-bold text-[#111318]">
                {item.product.reorderLevel}{' '}
                <span className="text-[11px] font-normal text-[#5F6673]">{item.product.baseUnit}</span>
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-bold text-[#8E95A2] uppercase tracking-widest mb-2">
              Reason
            </p>
            <div className="flex items-start gap-2 bg-[#FEF2ED] border border-[#F9CBBA] p-3 rounded-md">
              <span className="material-symbols-outlined text-[16px] text-[#C2410C]">warning</span>
              <p className="text-[11px] text-[#C2410C] font-medium leading-snug">
                Stock is below the {item.priority.toLowerCase()} replenishment threshold.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-bold text-[#8E95A2] uppercase tracking-widest mb-2">
              Recommended Reorder Quantity
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                step="0.1"
                value={editQty}
                onChange={(e) => setEditQty(Number(e.target.value))}
                className="w-24 bg-[#FFFFFF] border border-[#E5E5E0] rounded-md px-3 py-2 text-[14px] font-bold text-[#111318] focus:outline-none focus:border-[#2457FF]"
              />
              <span className="text-[12px] font-medium text-[#5F6673]">{item.product.baseUnit}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-[#E5E5E0] p-5 bg-[#F9F9F7] flex flex-col gap-2">
          <button
            onClick={handleCreate}
            disabled={isSubmitting || editQty <= 0}
            className="w-full bg-[#2457FF] text-white py-2.5 rounded-md text-[12px] font-bold uppercase tracking-wider hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Reorder'}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full bg-transparent text-[#5F6673] border border-[#E5E5E0] py-2.5 rounded-md text-[12px] font-bold uppercase tracking-wider hover:bg-[#F4F4F1] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

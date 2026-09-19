'use client';

import React from 'react';
import { InventoryBatch } from '../../../lib/inventory/models/batch';
import { ExpiryService } from '../../../lib/alerts/expiryService';

interface BatchReviewDrawerProps {
  batch: InventoryBatch | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAttention: (batchId: string) => Promise<void>;
}

export default function BatchReviewDrawer({
  batch,
  isOpen,
  onClose,
  onMarkAttention,
}: BatchReviewDrawerProps) {
  if (!isOpen || !batch) return null;

  const status = ExpiryService.getStatus(batch.expiryDate);
  const days = ExpiryService.getDaysRemaining(batch.expiryDate);

  const handleMark = async () => {
    await onMarkAttention(batch.id);
    onClose();
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
            <h2 className="text-[14px] font-bold text-[#111318] tracking-tight">Batch Review</h2>
            <p className="text-[10px] text-[#8E95A2] uppercase tracking-widest mt-0.5">
              Expiry & Shelf Life Details
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
            <h3 className="text-[14px] font-bold text-[#111318]">{batch.productName}</h3>
            <p className="text-[11px] font-mono text-[#5F6673]">{batch.productSku}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#F9F9F7] border border-[#E5E5E0] p-3 rounded-md">
              <p className="text-[9px] font-bold text-[#8E95A2] uppercase tracking-widest mb-1">
                Batch Number
              </p>
              <p className="text-[12px] font-mono font-bold text-[#111318]">{batch.id}</p>
            </div>
            <div className="bg-[#F9F9F7] border border-[#E5E5E0] p-3 rounded-md">
              <p className="text-[9px] font-bold text-[#8E95A2] uppercase tracking-widest mb-1">
                Available
              </p>
              <p className="text-[12px] font-bold text-[#111318]">
                {batch.quantity} <span className="text-[10px] font-normal text-[#5F6673] uppercase">{batch.unit}</span>
              </p>
            </div>
            <div className="bg-[#F9F9F7] border border-[#E5E5E0] p-3 rounded-md">
              <p className="text-[9px] font-bold text-[#8E95A2] uppercase tracking-widest mb-1">
                Received Date
              </p>
              <p className="text-[12px] font-bold text-[#111318]">
                {new Date(batch.receivedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="bg-[#FEF2ED] border border-[#F9CBBA] p-3 rounded-md">
              <p className="text-[9px] font-bold text-[#C2410C] uppercase tracking-widest mb-1">
                Expiry Date
              </p>
              <p className="text-[12px] font-bold text-[#C2410C]">
                {new Date(batch.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-[#8E95A2] uppercase tracking-widest">
                Shelf Life Status
              </p>
              <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${
                days <= 0 ? 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]' : 'bg-[#FFF4E5] text-[#B45309] border-[#FDE68A]'
              }`}>
                {status.replace('_', ' ')}
              </span>
            </div>
            <div className={`flex items-start gap-2 border p-3 rounded-md ${
              days <= 0 ? 'bg-[#FEF2ED] border-[#F9CBBA]' : 'bg-[#F9F9F7] border-[#E5E5E0]'
            }`}>
              <span className={`material-symbols-outlined text-[16px] ${days <= 0 ? 'text-[#C2410C]' : 'text-[#8E95A2]'}`}>
                timer
              </span>
              <p className={`text-[12px] font-bold ${days <= 0 ? 'text-[#C2410C]' : 'text-[#111318]'}`}>
                {days < 0 ? `${Math.abs(days)} days past expiry.` : days === 0 ? 'Expires today.' : `${days} days remaining.`}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-[#E5E5E0] p-5 bg-[#F9F9F7] flex flex-col gap-2">
          <button
            onClick={handleMark}
            className="w-full bg-[#2457FF] text-white py-2.5 rounded-md text-[12px] font-bold uppercase tracking-wider hover:bg-[#1D4ED8] transition-colors"
          >
            Mark For Attention
          </button>
          <button
            onClick={onClose}
            className="w-full bg-transparent text-[#5F6673] border border-[#E5E5E0] py-2.5 rounded-md text-[12px] font-bold uppercase tracking-wider hover:bg-[#F4F4F1] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

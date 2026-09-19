'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../home/components/Sidebar';
import AppHeader from '../home/components/AppHeader';
import ExpiryQueue from './components/ExpiryQueue';
import BatchReviewDrawer from './components/BatchReviewDrawer';
import { batchRepository } from '../../lib/inventory/repositories/batchRepository';
import { InventoryBatch } from '../../lib/inventory/models/batch';
import { ExpiryService } from '../../lib/alerts/expiryService';

export default function ExpiryPage() {
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ATTENTION');

  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      const data = await batchRepository.getAll();
      setBatches(data);
      setIsLoading(false);
    };
    fetchBatches();

    const unsubscribe = batchRepository.subscribe(async () => {
      const data = await batchRepository.getAll();
      setBatches(data);
    });
    return () => unsubscribe();
  }, []);

  const filteredBatches = useMemo(() => {
    let filtered = batches;

    // Apply Status Filter
    if (statusFilter === 'ATTENTION') {
      filtered = filtered.filter(b => ExpiryService.getStatus(b.expiryDate) !== 'SAFE');
    } else if (statusFilter !== 'ALL') {
      filtered = filtered.filter(b => ExpiryService.getStatus(b.expiryDate) === statusFilter);
    }

    // Apply Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        b =>
          b.productName.toLowerCase().includes(term) ||
          b.productSku.toLowerCase().includes(term) ||
          b.id.toLowerCase().includes(term)
      );
    }

    // Sort by criticality (days remaining)
    return filtered.sort((a, b) => {
      const daysA = ExpiryService.getDaysRemaining(a.expiryDate);
      const daysB = ExpiryService.getDaysRemaining(b.expiryDate);
      return daysA - daysB;
    });
  }, [batches, statusFilter, searchTerm]);

  const handleReviewBatch = (batch: InventoryBatch) => {
    setSelectedBatch(batch);
    setIsDrawerOpen(true);
  };

  const handleMarkAttention = async (batchId: string) => {
    await batchRepository.update(batchId, { needsAttention: true });
  };

  if (isLoading) {
    return <div className="flex h-screen bg-[#F7F7F4] items-center justify-center font-sans">Loading Expiry Engine...</div>;
  }

  return (
    <div className="flex h-screen bg-[#F7F7F4] font-sans text-[#111318] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader title="Expiry & Shelf" description="Track product shelf life" />

        <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-y-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[20px] text-[#2457FF]">
                schedule
              </span>
              <h1 className="text-[18px] font-bold text-[#111318] tracking-tight">
                Expiry & Shelf Clock
              </h1>
            </div>
            <p className="text-[12px] text-[#5F6673]">
              Track batch shelf life and identify inventory requiring attention.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg p-3 mb-4 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#8E95A2]">
                search
              </span>
              <input
                type="text"
                placeholder="Search product, SKU, batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F9F9F7] border border-[#E5E5E0] rounded-md pl-8 pr-3 py-1.5 text-[12px] font-medium text-[#111318] placeholder:text-[#8E95A2] focus:outline-none focus:border-[#2457FF] transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setStatusFilter('ATTENTION')}
                className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md border whitespace-nowrap ${
                  statusFilter === 'ATTENTION'
                    ? 'bg-[#2457FF] text-white border-[#2457FF]'
                    : 'bg-[#F9F9F7] text-[#5F6673] border-[#E5E5E0] hover:bg-[#F4F4F1]'
                }`}
              >
                Needs Attention
              </button>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md border whitespace-nowrap ${
                  statusFilter === 'ALL'
                    ? 'bg-[#2457FF] text-white border-[#2457FF]'
                    : 'bg-[#F9F9F7] text-[#5F6673] border-[#E5E5E0] hover:bg-[#F4F4F1]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('EXPIRED')}
                className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md border whitespace-nowrap ${
                  statusFilter === 'EXPIRED'
                    ? 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]'
                    : 'bg-[#F9F9F7] text-[#5F6673] border-[#E5E5E0] hover:bg-[#F4F4F1]'
                }`}
              >
                Expired
              </button>
              <button
                onClick={() => setStatusFilter('EXPIRING_SOON')}
                className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md border whitespace-nowrap ${
                  statusFilter === 'EXPIRING_SOON'
                    ? 'bg-[#FFF4E5] text-[#B45309] border-[#FDE68A]'
                    : 'bg-[#F9F9F7] text-[#5F6673] border-[#E5E5E0] hover:bg-[#F4F4F1]'
                }`}
              >
                Expiring Soon
              </button>
              <button
                onClick={() => setStatusFilter('UPCOMING')}
                className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md border whitespace-nowrap ${
                  statusFilter === 'UPCOMING'
                    ? 'bg-[#F0F4FF] text-[#2457FF] border-[#C7D6FF]'
                    : 'bg-[#F9F9F7] text-[#5F6673] border-[#E5E5E0] hover:bg-[#F4F4F1]'
                }`}
              >
                Upcoming
              </button>
            </div>
          </div>

          <ExpiryQueue batches={filteredBatches} onReviewBatch={handleReviewBatch} />
        </main>
      </div>

      <BatchReviewDrawer
        batch={selectedBatch}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onMarkAttention={handleMarkAttention}
      />
    </div>
  );
}

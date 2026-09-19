'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../home/components/Sidebar';
import AppHeader from '../home/components/AppHeader';
import ReplenishmentQueue, { QueueItem } from './components/ReplenishmentQueue';
import ReorderReviewDrawer from './components/ReorderReviewDrawer';
import RecentReorders from './components/RecentReorders';
import { useInventory } from '../../lib/inventory/hooks/useInventory';
import { StockAlertService } from '../../lib/alerts/stockAlertService';
import { ReorderService } from '../../lib/alerts/reorderService';
import { reorderRepository } from '../../lib/inventory/repositories/reorderRepository';
import { ReorderRecord } from '../../lib/inventory/models/reorder';

export default function ReplenishmentPage() {
  const { products, loading: isInventoryLoading } = useInventory();
  const [reorders, setReorders] = useState<ReorderRecord[]>([]);
  const [isReordersLoading, setIsReordersLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'LOW'>('ALL');

  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchReorders = async () => {
      const data = await reorderRepository.getAll();
      setReorders(data);
      setIsReordersLoading(false);
    };
    fetchReorders();

    const unsubscribe = reorderRepository.subscribe(async () => {
      const data = await reorderRepository.getAll();
      setReorders(data);
    });
    return () => unsubscribe();
  }, []);

  const queueItems = useMemo(() => {
    const items: QueueItem[] = [];
    products.forEach((p) => {
      const priority = StockAlertService.getPriority(p);
      if (priority !== 'NORMAL') {
        const suggestedQty = ReorderService.getSuggestedReorderQuantity(p);
        items.push({
          product: p,
          priority: priority as 'CRITICAL' | 'LOW',
          suggestedQty,
        });
      }
    });

    // Filter
    return items.filter((item) => {
      if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          item.product.name.toLowerCase().includes(term) ||
          item.product.sku.toLowerCase().includes(term)
        );
      }
      return true;
    }).sort((a, b) => {
      if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1;
      if (a.priority !== 'CRITICAL' && b.priority === 'CRITICAL') return 1;
      return 0;
    });
  }, [products, priorityFilter, searchTerm]);

  const handleReviewReorder = (item: QueueItem) => {
    setSelectedQueueItem(item);
    setIsDrawerOpen(true);
  };

  const handleCreateReorder = async (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    await ReorderService.createReorder({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity,
      unit: product.baseUnit,
      priority: StockAlertService.getPriority(product) as 'CRITICAL' | 'LOW',
      createdBy: 'Suresh R.',
    });
  };

  const isLoading = isInventoryLoading || isReordersLoading;

  if (isLoading) {
    return <div className="flex h-screen bg-[#F7F7F4] items-center justify-center font-sans">Loading Replenishment Engine...</div>;
  }

  return (
    <div className="flex h-screen bg-[#F7F7F4] font-sans text-[#111318] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader customStatus="REPLENISHMENT ACTIVE" />

        <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-y-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[20px] text-[#2457FF]">
                shopping_cart
              </span>
              <h1 className="text-[18px] font-bold text-[#111318] tracking-tight">
                Replenishment Engine
              </h1>
            </div>
            <p className="text-[12px] text-[#5F6673]">
              Review low-stock items and create controlled replenishment requests.
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
                placeholder="Search product, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F9F9F7] border border-[#E5E5E0] rounded-md pl-8 pr-3 py-1.5 text-[12px] font-medium text-[#111318] placeholder:text-[#8E95A2] focus:outline-none focus:border-[#2457FF] transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#5F6673]">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="bg-[#F9F9F7] border border-[#E5E5E0] rounded-md px-2 py-1.5 text-[12px] font-medium text-[#111318] focus:outline-none focus:border-[#2457FF]"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical Only</option>
                <option value="LOW">Low Only</option>
              </select>
            </div>
          </div>

          <ReplenishmentQueue items={queueItems} onReviewReorder={handleReviewReorder} />
          <RecentReorders reorders={reorders} />
        </main>
      </div>

      <ReorderReviewDrawer
        item={selectedQueueItem}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCreateReorder={handleCreateReorder}
      />
    </div>
  );
}

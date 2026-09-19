'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '../home/components/Sidebar';
import AppHeader from '../home/components/AppHeader';
import TransactionFilters from './components/TransactionFilters';
import TransactionList from './components/TransactionList';
import { InventoryTransaction } from '../../lib/inventory/models/transaction';
import { transactionRepository } from '../../lib/inventory/repositories/transactionRepository';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');

  useEffect(() => {
    const fetchTransactions = async () => {
      const data = await transactionRepository.getAll();
      setTransactions(data);
      setIsLoading(false);
    };

    fetchTransactions();

    // Subscribe to future updates
    const unsubscribe = transactionRepository.subscribe(async () => {
      const data = await transactionRepository.getAll();
      setTransactions(data);
    });

    return () => unsubscribe();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search (ID, Product Name, SKU, Operator)
      const matchesSearch =
        !searchTerm ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Type Filter
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;

      // 3. Source Filter
      if (sourceFilter !== 'ALL' && tx.source !== sourceFilter) return false;

      return true;
    });
  }, [transactions, searchTerm, typeFilter, sourceFilter]);

  if (isLoading) {
    return <div className="flex h-screen bg-[#F7F7F4] items-center justify-center font-sans">Loading Ledger...</div>;
  }

  return (
    <div className="flex h-screen bg-[#F7F7F4] font-sans text-[#111318] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader title="Transactions" description="Ledger & Audit trail" />

        <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-y-auto">
          {/* Page Header */}
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[20px] text-[#2457FF]">
                  table_rows
                </span>
                <h1 className="text-[18px] font-bold text-[#111318] tracking-tight">
                  Transaction Stream
                </h1>
              </div>
              <p className="text-[12px] text-[#5F6673]">
                Auditable ledger of all inward, outward, and manual inventory operations.
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#8E95A2] uppercase tracking-widest mb-0.5">
                Total Records
              </p>
              <p className="text-[16px] font-mono font-bold text-[#111318]">
                {filteredTransactions.length}
              </p>
            </div>
          </div>

          <TransactionFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            sourceFilter={sourceFilter}
            onSourceFilterChange={setSourceFilter}
          />

          <TransactionList transactions={filteredTransactions} />
        </main>
      </div>
    </div>
  );
}

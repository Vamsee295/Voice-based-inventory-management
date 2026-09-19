'use client';

import React from 'react';

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (source: string) => void;
}

export default function TransactionFilters({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  sourceFilter,
  onSourceFilterChange,
}: TransactionFiltersProps) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg p-3 mb-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#8E95A2]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by ID, product, or operator..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#F9F9F7] border border-[#E5E5E0] rounded-md pl-8 pr-3 py-1.5 text-[12px] font-medium text-[#111318] placeholder:text-[#8E95A2] focus:outline-none focus:border-[#2457FF] focus:bg-[#FFFFFF] transition-colors"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#5F6673]">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="bg-[#F9F9F7] border border-[#E5E5E0] rounded-md px-2 py-1.5 text-[12px] font-medium text-[#111318] focus:outline-none focus:border-[#2457FF]"
          >
            <option value="ALL">All Types</option>
            <option value="STOCK_IN">Stock In</option>
            <option value="STOCK_OUT">Stock Out</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#5F6673]">Source:</span>
          <select
            value={sourceFilter}
            onChange={(e) => onSourceFilterChange(e.target.value)}
            className="bg-[#F9F9F7] border border-[#E5E5E0] rounded-md px-2 py-1.5 text-[12px] font-medium text-[#111318] focus:outline-none focus:border-[#2457FF]"
          >
            <option value="ALL">All Sources</option>
            <option value="VOICE">Voice</option>
            <option value="MANUAL">Manual</option>
            <option value="BARCODE">Barcode</option>
            <option value="INVOICE">Invoice</option>
            <option value="CHALLAN">Challan</option>
          </select>
        </div>
      </div>
    </div>
  );
}

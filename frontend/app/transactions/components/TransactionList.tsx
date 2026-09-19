'use client';

import React from 'react';
import { InventoryTransaction } from '../../../lib/inventory/models/transaction';

interface TransactionListProps {
  transactions: InventoryTransaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg p-8 text-center shadow-sm">
        <span className="material-symbols-outlined text-[32px] text-[#D6D6D0] mb-2">
          receipt_long
        </span>
        <h3 className="text-[14px] font-bold text-[#111318] mb-1">No transactions found</h3>
        <p className="text-[12px] text-[#8E95A2]">Try adjusting your filters or search term.</p>
      </div>
    );
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'STOCK_IN':
        return 'bg-[#EDF7F2] text-[#16794A] border-[#C3E4D1]';
      case 'STOCK_OUT':
        return 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]';
      case 'ADJUSTMENT':
        return 'bg-[#F0F4FF] text-[#2457FF] border-[#C7D6FF]';
      default:
        return 'bg-[#F4F4F1] text-[#5F6673] border-[#E5E5E0]';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'VOICE':
        return 'mic';
      case 'BARCODE':
        return 'barcode_scanner';
      case 'INVOICE':
        return 'receipt';
      case 'CHALLAN':
        return 'local_shipping';
      default:
        return 'edit_note';
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F4F1] border-b border-[#ECECE8]">
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Transaction ID</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Timestamp</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Product / SKU</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Operation</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Change</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Balance</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Source & Operator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0EB]">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-[#F9F9F7] transition-colors">
                <td className="px-4 py-3">
                  <span className="text-[11px] font-mono font-medium text-[#5F6673]">
                    {tx.id.split('-').slice(0, 2).join('-')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-[#111318]">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-[#8E95A2]">
                      {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-semibold text-[#111318]">{tx.productName}</span>
                    <span className="text-[10px] font-mono text-[#8E95A2]">{tx.productSku}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${getTypeStyle(
                      tx.type
                    )}`}
                  >
                    {tx.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[12px] font-bold ${
                      tx.type === 'STOCK_IN'
                        ? 'text-[#16794A]'
                        : tx.type === 'STOCK_OUT'
                        ? 'text-[#C2410C]'
                        : 'text-[#2457FF]'
                    }`}
                  >
                    {tx.type === 'STOCK_IN' ? '+' : tx.type === 'STOCK_OUT' ? '-' : ''}
                    {tx.quantity} {tx.unit}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-[10px] text-[#8E95A2]">
                      <span>Prev:</span>
                      <span className="font-mono">{tx.previousStock.toFixed(1)} {tx.normalizedUnit}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#111318]">
                      <span>New:</span>
                      <span className="font-mono">{tx.newStock.toFixed(1)} {tx.normalizedUnit}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 mb-0.5 text-[#111318]">
                      <span className="material-symbols-outlined text-[14px] text-[#8E95A2]">
                        {getSourceIcon(tx.source)}
                      </span>
                      <span className="text-[11px] font-medium">{tx.source}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#5F6673]">
                      <span className="material-symbols-outlined text-[12px]">person</span>
                      <span className="text-[10px]">{tx.createdBy}</span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

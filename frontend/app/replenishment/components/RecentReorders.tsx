'use client';

import React from 'react';
import { ReorderRecord } from '../../../lib/inventory/models/reorder';

interface RecentReordersProps {
  reorders: ReorderRecord[];
}

export default function RecentReorders({ reorders }: RecentReordersProps) {
  if (reorders.length === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg p-6 text-center shadow-sm">
        <p className="text-[12px] text-[#8E95A2]">No recent reorders found.</p>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-[#FFF4E5] text-[#B45309] border-[#FDE68A]';
      case 'ORDERED':
        return 'bg-[#E5F0FF] text-[#1D4ED8] border-[#BFDBFE]';
      case 'RECEIVED':
        return 'bg-[#EDF7F2] text-[#16794A] border-[#C3E4D1]';
      case 'CANCELLED':
        return 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]';
      default:
        return 'bg-[#F4F4F1] text-[#5F6673] border-[#E5E5E0]';
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[#ECECE8] bg-[#F4F4F1]">
        <h2 className="text-[12px] font-bold text-[#111318] tracking-widest uppercase">
          Recent Reorders
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9F9F7] border-b border-[#E5E5E0]">
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Reorder ID</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Date</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Product</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Quantity</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Priority</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Status</th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-[#8E95A2] tracking-widest uppercase">Created By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0EB]">
            {reorders.map((ro) => (
              <tr key={ro.id} className="hover:bg-[#F9F9F7] transition-colors">
                <td className="px-4 py-3">
                  <span className="text-[11px] font-mono font-medium text-[#5F6673]">
                    {ro.id}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-medium text-[#111318]">
                    {new Date(ro.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[12px] font-semibold text-[#111318]">{ro.productName}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[12px] font-bold text-[#111318]">
                    {ro.quantity} <span className="text-[10px] font-normal text-[#5F6673]">{ro.unit}</span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider">
                    {ro.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${getStatusStyle(
                      ro.status
                    )}`}
                  >
                    {ro.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-[#5F6673]">
                    <span className="material-symbols-outlined text-[12px]">person</span>
                    <span className="text-[10px]">{ro.createdBy}</span>
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

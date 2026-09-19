'use client';

import { useState } from 'react';

interface ConfirmationPanelProps {
  onConfirm?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  isConfirmed?: boolean;
}

export default function ConfirmationPanel({
  onConfirm,
  onEdit,
  onCancel,
  isConfirmed = false,
}: ConfirmationPanelProps) {
  const [internalConfirmed, setInternalConfirmed] = useState(false);
  const confirmed = isConfirmed || internalConfirmed;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      setInternalConfirmed(true);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setInternalConfirmed(false);
    }
  };

  if (confirmed) {
    return (
      <div className="bg-[#E8F4EC] border border-[#C6E5D6] rounded-lg p-3.5 mb-3 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-[#16794A]">check_circle</span>
          <div>
            <p className="text-[13px] font-bold text-[#16794A]">Transaction Verified & Applied to Ledger</p>
            <p className="text-[11px] text-[#16794A]/80">Journal entry created · Balances refreshed in Master Catalog</p>
          </div>
        </div>
        <button
          onClick={handleCancel}
          className="text-[11px] font-bold uppercase tracking-wider text-[#16794A] hover:bg-[#C6E5D6] px-2.5 py-1 rounded border border-[#16794A]/30 transition-colors"
        >
          Reset Demo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#2457FF]/30 rounded-lg shadow-sm overflow-hidden mb-3">
      {/* Header */}
      <div className="px-4 py-2 border-b border-[#2457FF]/20 bg-[#EEF2FF] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[15px] text-[#2457FF]">verified_user</span>
          <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#2457FF]">
            Human-in-the-Loop Confirmation
          </h3>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-[#2457FF] bg-[#FFFFFF] border border-[#2457FF]/20 px-1.5 py-0.5 rounded">
          Gatekeeper Active
        </span>
      </div>

      {/* Body */}
      <div className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[18px] text-[#5F6673]">shield</span>
          <p className="text-[12px] text-[#5F6673]">
            <span className="font-semibold text-[#111318]">VoiceMate has prepared this inventory action.</span>{' '}
            Review before applying to master ledger.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={handleConfirm}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#2457FF] hover:bg-[#003ED7] active:bg-[#0030A3] focus:outline-none focus:ring-2 focus:ring-[#2457FF]/40 text-white text-[12px] font-bold rounded shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[15px]">done_all</span>
            CONFIRM & APPLY
          </button>

          <button
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#F4F4F1] hover:bg-[#EEEEEB] active:bg-[#E5E5E0] focus:outline-none focus:ring-2 focus:ring-[#5F6673]/30 text-[#111318] text-[12px] font-semibold border border-[#E5E5E0] rounded transition-all"
          >
            <span className="material-symbols-outlined text-[15px] text-[#5F6673]">edit</span>
            EDIT
          </button>

          <button
            onClick={handleCancel}
            className="inline-flex items-center justify-center px-3 py-2 bg-[#FFFFFF] hover:bg-[#FEF2ED] active:bg-[#FDE8E0] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/30 text-[#C2410C] text-[12px] font-semibold border border-[#E5E5E0] hover:border-[#F9CBBA] rounded transition-all"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

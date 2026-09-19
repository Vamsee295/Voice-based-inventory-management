'use client';

import { useState } from 'react';

interface UnifiedConfirmGateProps {
  onConfirm?: () => void;
  onEdit?: () => void;
  onDiscard?: () => void;
  isConfirmed?: boolean;
  ledgerEntryId?: string;
}

export default function UnifiedConfirmGate({
  onConfirm,
  onEdit,
  onDiscard,
  isConfirmed = false,
  ledgerEntryId,
}: UnifiedConfirmGateProps) {
  const [internalConfirmed, setInternalConfirmed] = useState(false);
  const confirmed = isConfirmed || internalConfirmed;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      setInternalConfirmed(true);
    }
  };

  const handleDiscard = () => {
    if (onDiscard) {
      onDiscard();
    } else {
      setInternalConfirmed(false);
    }
  };

  // ── Confirmed State ───────────────────────────────────────────────────────
  if (confirmed) {
    const entryId = ledgerEntryId ?? `TXN-${Date.now().toString(36).toUpperCase()}`;
    return (
      <div className="bg-[#E8F4EC] border border-[#C6E5D6] rounded-md overflow-hidden mb-3">
        <div className="px-4 py-2 border-b border-[#C6E5D6] bg-[#D4EEE0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[9px] font-bold tracking-widest uppercase text-[#16794A] bg-[#FFFFFF] border border-[#C6E5D6] px-2 py-0.5 rounded-sm font-mono">
              04
            </span>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#16794A]">
              CONFIRM
            </span>
            <span className="text-[10px] text-[#16794A]/80 font-medium">
              · Applied to Master Ledger
            </span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#16794A] bg-[#FFFFFF] border border-[#C6E5D6] px-2 py-0.5 rounded">
            COMMITTED
          </span>
        </div>

        <div className="px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px] text-[#16794A]">
              check_circle
            </span>
            <div>
              <p className="text-[13px] font-bold text-[#16794A]">
                Transaction Verified &amp; Applied to Ledger
              </p>
              <p className="text-[11px] text-[#16794A]/80">
                Journal entry created · Balances refreshed in Master Catalog
              </p>
              <p className="text-[10px] font-mono text-[#16794A]/70 mt-0.5">
                Entry ID: {entryId} · Confirmed by Suresh R.
              </p>
            </div>
          </div>
          <button
            onClick={handleDiscard}
            className="text-[11px] font-bold uppercase tracking-wider text-[#16794A] hover:bg-[#C6E5D6] px-3 py-1.5 rounded border border-[#16794A]/30 transition-colors shrink-0"
          >
            New Entry
          </button>
        </div>
      </div>
    );
  }

  // ── Gate State ────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#FFFFFF] border border-[#2457FF]/30 rounded-md overflow-hidden mb-3">
      {/* Stage Header */}
      <div className="px-4 py-2 border-b border-[#2457FF]/20 bg-[#EEF2FF] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] font-bold tracking-widest uppercase text-[#2457FF] bg-[#FFFFFF] border border-[#2457FF]/30 px-2 py-0.5 rounded-sm font-mono">
            04
          </span>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#2457FF]">
            CONFIRM
          </span>
          <span className="text-[10px] text-[#2457FF]/70 font-medium">
            · Operator Decision Gate
          </span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-[#2457FF] bg-[#FFFFFF] border border-[#2457FF]/20 px-2 py-0.5 rounded">
          Awaiting Operator
        </span>
      </div>

      {/* Body */}
      <div className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[18px] text-[#5F6673] mt-0.5 shrink-0">
            shield
          </span>
          <div>
            <p className="text-[12px] font-semibold text-[#111318]">
              Apply this verified change to the master inventory ledger?
            </p>
            <p className="text-[11px] text-[#5F6673] mt-0.5">
              VoiceMate has prepared and validated this transaction. Review before committing.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            id="btn-confirm-apply"
            onClick={handleConfirm}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-[#2457FF] hover:bg-[#003ED7] active:bg-[#0030A3] focus:outline-none focus:ring-2 focus:ring-[#2457FF]/40 text-white text-[12px] font-bold rounded transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[15px]">done_all</span>
            CONFIRM &amp; APPLY
          </button>

          <button
            id="btn-edit-values"
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#F4F4F1] hover:bg-[#EEEEEB] active:bg-[#E5E5E0] focus:outline-none focus:ring-2 focus:ring-[#5F6673]/30 text-[#111318] text-[12px] font-semibold border border-[#E5E5E0] rounded transition-all"
          >
            <span className="material-symbols-outlined text-[14px] text-[#5F6673]">edit</span>
            EDIT VALUES
          </button>

          <button
            id="btn-discard-buffer"
            onClick={handleDiscard}
            className="inline-flex items-center justify-center px-3 py-2 bg-[#FFFFFF] hover:bg-[#FEF2ED] active:bg-[#FDE8E0] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/30 text-[#C2410C] text-[12px] font-semibold border border-[#E5E5E0] hover:border-[#F9CBBA] rounded transition-all"
          >
            DISCARD BUFFER
          </button>
        </div>
      </div>
    </div>
  );
}

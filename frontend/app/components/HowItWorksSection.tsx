import React from 'react';

export default function HowItWorksSection() {
  return (
    <section className="w-full py-20 bg-[var(--surface)] border-b border-[var(--border)]">
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8">
        <div className="mb-12">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold block mb-2">Linear Precision</span>
          <h2 className="text-[28px] font-semibold text-[var(--text-primary)] tracking-tight">
            From spoken words to a verified inventory action.
          </h2>
        </div>

        {/* Horizontal Process Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 01 */}
          <div className="bg-white p-6 rounded-lg border border-[var(--border)] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border)]">
                <span className="text-[11px] text-[var(--primary)] font-bold tracking-wider">01 / SPEAK</span>
                <span className="material-symbols-outlined text-[18px] text-[var(--text-tertiary)]">mic</span>
              </div>
              <div className="bg-[var(--surface-low)] p-3 rounded mb-4 border border-[var(--border)]">
                <p className="text-[13px] text-[var(--text-primary)] italic font-medium">“Rice 50 kg add.”</p>
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                Spoken naturally without structured syntax or pause commands in noisy ambient environments.
              </p>
            </div>
            <div className="pt-4 mt-4 bg-[var(--surface-container)] px-3 py-1.5 rounded border border-[var(--border)]">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Raw Audio Input</span>
            </div>
          </div>

          {/* Step 02 */}
          <div className="bg-white p-6 rounded-lg border border-[var(--border)] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border)]">
                <span className="text-[11px] text-[var(--primary)] font-bold tracking-wider">02 / UNDERSTAND</span>
                <span className="material-symbols-outlined text-[18px] text-[var(--text-tertiary)]">segment</span>
              </div>
              <div className="bg-[var(--surface-low)] p-3 rounded mb-4 border border-[var(--border)]">
                <p className="text-[13px] text-[var(--text-primary)] font-medium">Intent: Stock In<br/>Item: Rice<br/>Qty: 50 kg</p>
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                VoiceMate extracts the intent, identifies the product, and parses the exact quantity.
              </p>
            </div>
            <div className="pt-4 mt-4 bg-[var(--surface-container)] px-3 py-1.5 rounded border border-[var(--border)]">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Catalog Mapping</span>
            </div>
          </div>

          {/* Step 03 */}
          <div className="bg-white p-6 rounded-lg border border-[var(--border)] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border)]">
                <span className="text-[11px] text-[var(--primary)] font-bold tracking-wider">03 / REVIEW</span>
                <span className="material-symbols-outlined text-[18px] text-[var(--text-tertiary)]">scale</span>
              </div>
              <div className="bg-[#fef8ee] p-3 rounded mb-4 border border-[#fde6c5]">
                <p className="text-[13px] text-[var(--warning)] font-medium">Pending: +50 kg</p>
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                You see exactly what VoiceMate understood before any changes are made to the ledger.
              </p>
            </div>
            <div className="pt-4 mt-4 bg-[var(--surface-container)] px-3 py-1.5 rounded border border-[var(--border)]">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Human Validation</span>
            </div>
          </div>

          {/* Step 04 */}
          <div className="bg-white p-6 rounded-lg border border-[var(--border)] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border)]">
                <span className="text-[11px] text-[var(--primary)] font-bold tracking-wider">04 / RECORD</span>
                <span className="material-symbols-outlined text-[18px] text-[var(--text-tertiary)]">check_circle</span>
              </div>
              <div className="bg-[#eaf5ee] p-3 rounded mb-4 border border-[#c1e6cf]">
                <p className="text-[13px] text-[var(--success)] font-bold">+50.00 kg appended</p>
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                Permanent append to the digital register upon physical tap verification.
              </p>
            </div>
            <div className="pt-4 mt-4 bg-[var(--surface-container)] px-3 py-1.5 rounded border border-[var(--border)]">
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Verified Post</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

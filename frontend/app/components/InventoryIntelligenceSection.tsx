import React from 'react';

export default function InventoryIntelligenceSection() {
  return (
    <section className="w-full py-20 bg-[var(--surface-low)] border-b border-[var(--border)]">
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold block mb-2">Decision Architecture</span>
          <h2 className="text-[28px] font-semibold text-[var(--text-primary)] mb-4 tracking-tight">
            Don't just see low stock. Know what to do.
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            VoiceMate calculates consumption run-rates against distributor delivery cycles so you never run dry on fast-moving staples.
          </p>
        </div>

        {/* Realistic Rice Product Analysis Table */}
        <div className="bg-white rounded-lg shadow-sm border border-[var(--border)] overflow-hidden">
          <div className="p-6 bg-[var(--surface-low)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)]">
            <div>
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">Active Run-Rate Analysis</span>
              <h3 className="text-[17px] text-[var(--text-primary)] font-semibold">Sona Masoori Rice (25kg Bags) · SKU #RIC-840</h3>
            </div>
            <div className="flex items-center gap-2 bg-[#fef2f2] px-3 py-1.5 rounded border border-[#fee2e2]">
              <span className="w-2 h-2 rounded-full bg-[var(--danger)] animate-pulse"></span>
              <span className="text-[11px] text-[var(--danger)] font-bold uppercase tracking-wider">Depletion Imminent</span>
            </div>
          </div>

          {/* Ledger Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 p-6 gap-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">Current Stock</span>
              <p className="text-[24px] text-[var(--text-primary)] font-semibold tracking-tight">18.00 kg</p>
              <span className="text-[13px] text-[var(--text-secondary)]">Below 1 whole bag</span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">Daily Run-Rate</span>
              <p className="text-[24px] text-[var(--text-primary)] font-semibold tracking-tight">7.20 kg / day</p>
              <span className="text-[13px] text-[var(--text-secondary)]">7-day moving avg</span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">Distributor Lead</span>
              <p className="text-[24px] text-[var(--text-primary)] font-semibold tracking-tight">2 Days</p>
              <span className="text-[13px] text-[var(--text-secondary)]">Sri Rama Wholesale</span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">Safety Buffer</span>
              <p className="text-[24px] text-[var(--text-primary)] font-semibold tracking-tight">5.00 kg</p>
              <span className="text-[13px] text-[var(--text-secondary)]">Base reserve threshold</span>
            </div>
            <div className="col-span-2 md:col-span-1 space-y-1">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">Projected Exhaustion</span>
              <p className="text-[24px] text-[var(--danger)] font-semibold tracking-tight">In 48 Hours</p>
              <span className="text-[13px] text-[var(--text-secondary)]">Thursday midday</span>
            </div>
          </div>

          {/* Contextual Recommendation Bar */}
          <div className="p-6 bg-[#f5f7ff] border-t border-[var(--border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[var(--primary)] text-[24px]">assignment_late</span>
              <div>
                <span className="text-[15px] text-[var(--text-primary)] font-semibold block mb-1">
                  Reorder Recommendation: 5 Bags (125 kg)
                </span>
                <p className="text-[13px] text-[var(--text-secondary)]">
                  Distributor cutoff is Thursday 4:00 PM for Saturday morning delivery.
                </p>
              </div>
            </div>
            <button className="w-full md:w-auto bg-[var(--primary)] text-white text-sm font-medium px-5 py-2.5 rounded hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>Generate WhatsApp PO</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

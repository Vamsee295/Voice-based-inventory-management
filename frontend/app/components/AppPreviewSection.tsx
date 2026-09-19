import React from 'react';

export default function AppPreviewSection() {
  return (
    <section className="w-full py-20 bg-[var(--surface-low)] border-b border-[var(--border)]">
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold block mb-2">Daily Register</span>
            <h2 className="text-[28px] font-semibold text-[var(--text-primary)] tracking-tight">
              Operational Workspace
            </h2>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <span className="text-[13px] font-medium text-[var(--text-secondary)]">Tuesday, October 24</span>
            <span className="bg-[var(--surface-container)] text-[var(--text-primary)] text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded">Store Active</span>
          </div>
        </div>

        {/* Realistic Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: Summaries & Low Stock */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-5 rounded-lg border border-[var(--border)] shadow-sm">
              <span className="text-[11px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider block mb-1">Today's Inward Movements</span>
              <p className="text-[24px] text-[var(--text-primary)] font-bold font-mono tracking-tight">₹24,850.00</p>
              <span className="text-[13px] text-[var(--text-secondary)]">6 distributor entries validated</span>
            </div>
            
            <div className="bg-white p-5 rounded-lg border border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-2 bg-[var(--surface-low)] px-3 py-1.5 rounded border border-[var(--border)]">
                <span className="text-[11px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider">Needs Attention</span>
                <span className="text-[11px] text-[var(--danger)] font-bold uppercase tracking-wider">3 Items Low</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-baseline justify-between py-1 border-b border-[var(--border)]">
                  <div>
                    <span className="text-[13px] text-[var(--text-primary)] font-semibold block">Sona Masoori Rice</span>
                    <span className="text-[11px] text-[var(--text-secondary)]">Run rate: 7.2 kg/day</span>
                  </div>
                  <span className="text-[13px] text-[var(--danger)] font-bold">18 kg left</span>
                </div>
                <div className="flex items-baseline justify-between py-1 border-b border-[var(--border)]">
                  <div>
                    <span className="text-[13px] text-[var(--text-primary)] font-semibold block">Fortune Sunflower Oil 15L</span>
                    <span className="text-[11px] text-[var(--text-secondary)]">Run rate: 1.1 tins/day</span>
                  </div>
                  <span className="text-[13px] text-[var(--warning)] font-bold">2 tins left</span>
                </div>
                <div className="flex items-baseline justify-between py-1">
                  <div>
                    <span className="text-[13px] text-[var(--text-primary)] font-semibold block">Sugar Medium S-30</span>
                    <span className="text-[11px] text-[var(--text-secondary)]">Run rate: 12 kg/day</span>
                  </div>
                  <span className="text-[13px] text-[var(--warning)] font-bold">35 kg left</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Live Ledger Audit */}
          <div className="lg:col-span-8 bg-white rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
            <div className="p-4 bg-[var(--surface-low)] flex items-center justify-between border-b border-[var(--border)]">
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold">Live Ledger Audit Feed</span>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Chronological Appends</span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              <div className="p-4 flex items-center justify-between hover:bg-[var(--surface-low)] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-[13px] font-mono text-[var(--text-tertiary)]">11:42</span>
                  <div>
                    <span className="text-[15px] text-[var(--text-primary)] font-semibold block">Sona Masoori Rice (25kg)</span>
                    <span className="text-[13px] text-[var(--text-secondary)]">Voice Inward · Confirmed by Owner</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-bold text-[var(--success)] block">+2 Bags (+50 kg)</span>
                  <span className="text-[11px] text-[var(--text-tertiary)]">Bal: 68.00 kg</span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-[var(--surface-low)] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-[13px] font-mono text-[var(--text-tertiary)]">10:15</span>
                  <div>
                    <span className="text-[15px] text-[var(--text-primary)] font-semibold block">Fortune Refined Sunflower Oil</span>
                    <span className="text-[13px] text-[var(--text-secondary)]">Challan Scan #SR-9921 · Reviewed</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-bold text-[var(--success)] block">+2 Tins (+30 L)</span>
                  <span className="text-[11px] text-[var(--text-tertiary)]">Bal: 2 Tins</span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-[var(--surface-low)] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-[13px] font-mono text-[var(--text-tertiary)]">09:30</span>
                  <div>
                    <span className="text-[15px] text-[var(--text-primary)] font-semibold block">Maggi 2-Min Noodles 70g</span>
                    <span className="text-[13px] text-[var(--text-secondary)]">Voice Inward · Confirmed by Owner</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-bold text-[var(--success)] block">+10 Packets</span>
                  <span className="text-[11px] text-[var(--text-tertiary)]">Bal: 48 pkts</span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-[var(--surface-low)] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-[13px] font-mono text-[var(--text-tertiary)]">08:50</span>
                  <div>
                    <span className="text-[15px] text-[var(--text-primary)] font-semibold block">Toor Dal Loose Grade-A</span>
                    <span className="text-[13px] text-[var(--text-secondary)]">Challan Scan #SR-9921 · Reviewed</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-bold text-[var(--success)] block">+50.00 kg</span>
                  <span className="text-[11px] text-[var(--text-tertiary)]">Bal: 82.50 kg</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-[var(--surface-container)] text-center border-t border-[var(--border)]">
              <a href="#" className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider hover:underline">
                View complete day transaction journal →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

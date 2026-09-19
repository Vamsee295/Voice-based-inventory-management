import React from 'react';

export default function ShopFloorDialectsSection() {
  return (
    <section className="w-full py-20 bg-[var(--surface-low)] border-b border-[var(--border)]">
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold block mb-2">Dialect Agnostic</span>
            <h2 className="text-[28px] font-semibold text-[var(--text-primary)] mb-4 tracking-tight">
              Speak the way your shop floor sounds.
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] mb-8 leading-relaxed">
              Real trade speech naturally blends regional terms with English packaging and local quantity units. VoiceMate parses everyday shop idioms without needing formal phrasing or robotic commands.
            </p>
            <div className="bg-white p-5 rounded-lg border border-[var(--border)] shadow-sm">
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold block mb-3">Supported Unit Variations</span>
              <div className="flex flex-wrap gap-2">
                <span className="bg-[var(--surface-container)] text-[var(--text-primary)] text-[13px] font-medium px-2 py-1 rounded">Bags (బస్తా)</span>
                <span className="bg-[var(--surface-container)] text-[var(--text-primary)] text-[13px] font-medium px-2 py-1 rounded">Tins (డబ్బా)</span>
                <span className="bg-[var(--surface-container)] text-[var(--text-primary)] text-[13px] font-medium px-2 py-1 rounded">Kattas (కట్ట)</span>
                <span className="bg-[var(--surface-container)] text-[var(--text-primary)] text-[13px] font-medium px-2 py-1 rounded">Cartons (ಪೆಟ್ಟಿಗೆ)</span>
                <span className="bg-[var(--surface-container)] text-[var(--text-primary)] text-[13px] font-medium px-2 py-1 rounded">Quintals (குவிண்டால்)</span>
              </div>
            </div>
          </div>

          {/* Vertical Stream of Parsed Real Interactions */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
            <div className="p-4 bg-[var(--surface-low)] flex items-center justify-between border-b border-[var(--border)]">
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold">Real Counter Verifications</span>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Dialect → Normalized Trade Record</span>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {/* Interaction 1 */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-low)] transition-colors">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider">Telugu + English</span>
                  <p className="text-[17px] font-medium text-[var(--text-primary)]">“Rice rendu bags vachayi”</p>
                  <span className="text-[13px] text-[var(--text-tertiary)] block">Spoken during morning stock intake</span>
                </div>
                <div className="text-left sm:text-right bg-[var(--surface-low)] sm:bg-transparent p-3 sm:p-0 rounded border border-[var(--border)] sm:border-transparent">
                  <span className="text-[15px] text-[var(--text-primary)] font-semibold block">Rice (Sona Masoori)</span>
                  <span className="text-sm font-bold text-[var(--success)]">+2 Bags (+50.00 kg)</span>
                </div>
              </div>

              {/* Interaction 2 */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-low)] transition-colors">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider">Telugu + English</span>
                  <p className="text-[17px] font-medium text-[var(--text-primary)]">“Maggi 10 packets add cheyyi”</p>
                  <span className="text-[13px] text-[var(--text-tertiary)] block">Counter clerk quick inward log</span>
                </div>
                <div className="text-left sm:text-right bg-[var(--surface-low)] sm:bg-transparent p-3 sm:p-0 rounded border border-[var(--border)] sm:border-transparent">
                  <span className="text-[15px] text-[var(--text-primary)] font-semibold block">Maggi 2-Min Noodles 70g</span>
                  <span className="text-sm font-bold text-[var(--success)]">+10 Packets</span>
                </div>
              </div>

              {/* Interaction 3 */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-low)] transition-colors">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider">Hindi + English</span>
                  <p className="text-[17px] font-medium text-[var(--text-primary)]">“Fortune oil ke do dabbe add karo”</p>
                  <span className="text-[13px] text-[var(--text-tertiary)] block">Wholesale oil tin inward ledger</span>
                </div>
                <div className="text-left sm:text-right bg-[var(--surface-low)] sm:bg-transparent p-3 sm:p-0 rounded border border-[var(--border)] sm:border-transparent">
                  <span className="text-[15px] text-[var(--text-primary)] font-semibold block">Fortune Refined Sunflower Oil</span>
                  <span className="text-sm font-bold text-[var(--success)]">+2 Tins (+30.00 L)</span>
                </div>
              </div>

              {/* Interaction 4 */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-low)] transition-colors">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider">Telugu Stock Query</span>
                  <p className="text-[17px] font-medium text-[var(--text-primary)]">“Amul butter rendu boxes unte chudu”</p>
                  <span className="text-[13px] text-[var(--text-tertiary)] block">Shelf check without leaving customer</span>
                </div>
                <div className="text-left sm:text-right bg-[var(--surface-low)] sm:bg-transparent p-3 sm:p-0 rounded border border-[var(--border)] sm:border-transparent">
                  <span className="text-[15px] text-[var(--text-primary)] font-semibold block">Query: Amul Butter 100g</span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">18 packs on hand</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

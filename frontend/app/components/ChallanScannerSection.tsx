import React from 'react';

export default function ChallanScannerSection() {
  return (
    <section className="w-full py-20 bg-[var(--surface-low)] border-b border-[var(--border)]">
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 pt-2">
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold block mb-2">Paper Reconciliation</span>
            <h2 className="text-[28px] font-semibold text-[var(--text-primary)] mb-4 tracking-tight">
              Paper in. Inventory updated.
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] mb-8 leading-relaxed">
              Snap paper distributor challans and handwritten delivery slips. Line items, batches, and wholesale taxes extract directly into clean ledger rows ready for review.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[var(--primary)] text-[20px] mt-0.5">document_scanner</span>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--text-primary)] font-semibold">Automatic Unit Association:</strong> Extracts cases, bags, dozens, and translates them to inventory units.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[var(--primary)] text-[20px] mt-0.5">price_check</span>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--text-primary)] font-semibold">Cost Drift Alerts:</strong> Highlights wholesale price variations compared to the last inward challan.
                </p>
              </div>
            </div>
          </div>

          {/* Challan Extraction Sheet */}
          <div className="lg:col-span-7 bg-white rounded-lg shadow-sm border border-[var(--border)] overflow-hidden">
            <div className="p-4 bg-[var(--surface-low)] flex items-center justify-between border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[var(--text-tertiary)]">receipt_long</span>
                <span className="text-[13px] text-[var(--text-primary)] font-semibold">Challan Preview: Sri Rama Wholesalers #SR-9921</span>
              </div>
              <span className="text-[11px] text-[var(--success)] bg-[#eaf5ee] border border-[#c1e6cf] px-2 py-0.5 rounded font-bold uppercase tracking-wide">Processed</span>
            </div>

            {/* Extracted Lines Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[var(--surface-container)] text-[11px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider border-b border-[var(--border)]">
                  <tr>
                    <th className="py-2 px-4 font-bold">Item Description</th>
                    <th className="py-2 px-4 text-right font-bold">Qty</th>
                    <th className="py-2 px-4 text-right font-bold">Unit Rate</th>
                    <th className="py-2 px-4 text-right font-bold">Amount</th>
                    <th className="py-2 px-4 text-center font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  <tr className="hover:bg-[var(--surface-low)] transition-colors">
                    <td className="py-3 px-4 text-[var(--text-primary)] font-semibold">Sona Masoori Rice 25kg</td>
                    <td className="py-3 px-4 text-right font-medium text-[var(--text-primary)]">4 Bags</td>
                    <td className="py-3 px-4 text-right text-[var(--text-secondary)] font-mono">₹1,320.00</td>
                    <td className="py-3 px-4 text-right text-[var(--text-primary)] font-mono font-medium">₹5,280.00</td>
                    <td className="py-3 px-4 text-center"><span className="text-[var(--success)] text-[11px] font-bold uppercase">Mapped</span></td>
                  </tr>
                  <tr className="hover:bg-[var(--surface-low)] transition-colors">
                    <td className="py-3 px-4 text-[var(--text-primary)] font-semibold">Fortune Refined Sunflower 15L</td>
                    <td className="py-3 px-4 text-right font-medium text-[var(--text-primary)]">2 Tins</td>
                    <td className="py-3 px-4 text-right text-[var(--text-secondary)] font-mono">₹1,850.00</td>
                    <td className="py-3 px-4 text-right text-[var(--text-primary)] font-mono font-medium">₹3,700.00</td>
                    <td className="py-3 px-4 text-center"><span className="text-[var(--success)] text-[11px] font-bold uppercase">Mapped</span></td>
                  </tr>
                  <tr className="hover:bg-[var(--surface-low)] transition-colors">
                    <td className="py-3 px-4 text-[var(--text-primary)] font-semibold">Tata Salt 1kg Packets</td>
                    <td className="py-3 px-4 text-right font-medium text-[var(--text-primary)]">1 Carton (24)</td>
                    <td className="py-3 px-4 text-right text-[var(--text-secondary)] font-mono">₹24.00</td>
                    <td className="py-3 px-4 text-right text-[var(--text-primary)] font-mono font-medium">₹576.00</td>
                    <td className="py-3 px-4 text-center"><span className="text-[var(--success)] text-[11px] font-bold uppercase">Mapped</span></td>
                  </tr>
                  <tr className="hover:bg-[var(--surface-low)] transition-colors">
                    <td className="py-3 px-4 text-[var(--text-primary)] font-semibold">Toor Dal Loose Grade-A</td>
                    <td className="py-3 px-4 text-right font-medium text-[var(--text-primary)]">50.00 kg</td>
                    <td className="py-3 px-4 text-right text-[var(--text-secondary)] font-mono">₹148.00</td>
                    <td className="py-3 px-4 text-right text-[var(--text-primary)] font-mono font-medium">₹7,400.00</td>
                    <td className="py-3 px-4 text-center"><span className="text-[var(--success)] text-[11px] font-bold uppercase">Mapped</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Footer & Review Action */}
            <div className="p-4 bg-[#f5f7ff] border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider">Challan Total:</span>
                <span className="text-[17px] text-[var(--text-primary)] font-bold font-mono tracking-tight">₹16,956.00</span>
              </div>
              <button className="w-full sm:w-auto bg-[var(--primary)] text-white text-[13px] font-semibold px-4 py-2 rounded hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
                Review and Import Line Items
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

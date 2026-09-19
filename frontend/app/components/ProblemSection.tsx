import React from 'react';

export default function ProblemSection() {
  return (
    <section className="w-full py-20 bg-[var(--surface-low)] border-y border-[var(--border)]">
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold block mb-2">Operational Reality</span>
          <h2 className="text-[28px] leading-9 font-semibold text-[var(--text-primary)] mb-4 tracking-tight">
            Inventory shouldn't slow down the business.
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            Inventory work often happens while you're receiving deliveries, serving customers, checking stock and managing suppliers. Typing every movement into software adds friction.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {/* Traditional Reality */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-[var(--border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-6 bg-[var(--surface-low)] px-4 py-2 rounded border border-[var(--border)]">
                <span className="text-[11px] uppercase tracking-wider text-[var(--danger)] font-bold">Traditional Shop Routine</span>
                <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Delayed Ledger</span>
              </div>
              <ol className="space-y-6 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-4">
                  <span className="text-[11px] text-[var(--text-tertiary)] font-bold w-6 pt-0.5">01</span>
                  <div>
                    <strong className="font-semibold text-[var(--text-primary)] block text-[15px] mb-1">Delivery arrives</strong>
                    <span>Lorry unloads 40 sacks onto the pavement while customers queue at the register counter.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[11px] text-[var(--text-tertiary)] font-bold w-6 pt-0.5">02</span>
                  <div>
                    <strong className="font-semibold text-[var(--text-primary)] block text-[15px] mb-1">Someone remembers quantities</strong>
                    <span>Wholesale delivery boy yells quantities over the noise; shop boy nods from the aisle.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[11px] text-[var(--text-tertiary)] font-bold w-6 pt-0.5">03</span>
                  <div>
                    <strong className="font-semibold text-[var(--text-primary)] block text-[15px] mb-1">Scribbled on paper / WhatsApp</strong>
                    <span>A slip of cardboard or a fleeting voice note is saved on a shared phone with zero tallying.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[11px] text-[var(--text-tertiary)] font-bold w-6 pt-0.5">04</span>
                  <div>
                    <strong className="font-semibold text-[var(--text-primary)] block text-[15px] mb-1">Entered into PC hours later</strong>
                    <span>At 10:30 PM, tired fingers type partial numbers into an inventory terminal.</span>
                  </div>
                </li>
              </ol>
            </div>
            <div className="mt-8 pt-4 bg-[var(--surface-low)] px-4 py-3 rounded border border-[var(--border)]">
              <span className="text-[11px] text-[var(--danger)] font-bold uppercase tracking-wider">Outcome</span>
              <p className="text-[13px] text-[var(--text-tertiary)] mt-1 font-medium">
                Stock records run 12 to 24 hours behind physical shelves. Overselling and emergency shortages occur daily.
              </p>
            </div>
          </div>

          {/* With VoiceMate */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-[var(--border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-6 bg-[#f5f7ff] border border-[#dce4ff] px-4 py-2 rounded">
                <span className="text-[11px] uppercase tracking-wider text-[var(--primary)] font-bold">With VoiceMate</span>
                <span className="text-[11px] text-[var(--success)] bg-[#eaf5ee] border border-[#c1e6cf] px-2 py-0.5 rounded font-bold uppercase tracking-wide">Synchronized</span>
              </div>
              <ol className="space-y-6 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-4">
                  <span className="text-[11px] text-[var(--primary)] font-bold w-6 pt-0.5">01</span>
                  <div>
                    <strong className="font-semibold text-[var(--text-primary)] block text-[15px] mb-1">Delivery arrives</strong>
                    <span>Bags touch the floor; operator raises the counter terminal mic or mobile ledger.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[11px] text-[var(--primary)] font-bold w-6 pt-0.5">02</span>
                  <div>
                    <strong className="font-semibold text-[var(--text-primary)] block text-[15px] mb-1">Shopkeeper speaks naturally</strong>
                    <span>Phrased in regional trade speech: “Rice rendu bags, Toor dal five packets add cheyyi.”</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[11px] text-[var(--primary)] font-bold w-6 pt-0.5">03</span>
                  <div>
                    <strong className="font-semibold text-[var(--text-primary)] block text-[15px] mb-1">System converts trade units</strong>
                    <span>VoiceMate normalizes custom bag sizes into standard kilograms without mental arithmetic.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[11px] text-[var(--primary)] font-bold w-6 pt-0.5">04</span>
                  <div>
                    <strong className="font-semibold text-[var(--text-primary)] block text-[15px] mb-1">Owner reviews and confirms in 2 seconds</strong>
                    <span>A single tactile tap records the ledger row with full audit traceability.</span>
                  </div>
                </li>
              </ol>
            </div>
            <div className="mt-8 pt-4 bg-[#f5f7ff] border border-[#dce4ff] px-4 py-3 rounded">
              <span className="text-[11px] text-[var(--primary)] font-bold uppercase tracking-wider">Outcome</span>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1 font-medium">
                Zero lag between floor delivery and system ledger. Reorder intelligence triggers immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

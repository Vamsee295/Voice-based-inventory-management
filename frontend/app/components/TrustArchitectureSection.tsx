import React from 'react';

export default function TrustArchitectureSection() {
  return (
    <section className="w-full py-20 bg-[var(--surface)] border-b border-[var(--border)]">
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold block mb-2">Operational Trust</span>
          <h2 className="text-[28px] font-semibold text-[var(--text-primary)] mb-4 tracking-tight">
            AI suggests. You stay in control.
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            VoiceMate does not silently change inventory based on an uncertain interpretation. Every inward delivery and counter deduction requires explicit human verification.
          </p>
        </div>

        {/* Trust Architecture Ribbon */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-[var(--border)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-center lg:text-left">
            <div className="flex flex-col items-center lg:items-start">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">01 Input</span>
              <span className="text-[15px] font-semibold text-[var(--text-primary)]">Voice or Paper</span>
              <p className="text-[13px] text-[var(--text-secondary)] mt-2 leading-relaxed">Spoken dialect utterance or captured challan photo.</p>
            </div>
            <div className="flex flex-col items-center lg:items-start lg:pl-6 lg:border-l border-[var(--border)]">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">02 Analysis</span>
              <span className="text-[15px] font-semibold text-[var(--text-primary)]">Interpretation</span>
              <p className="text-[13px] text-[var(--text-secondary)] mt-2 leading-relaxed">Item identified, local trade unit converted to standard units.</p>
            </div>
            <div className="flex flex-col items-center lg:items-start lg:pl-6 lg:border-l border-[var(--border)]">
              <span className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider mb-2">03 Oversight</span>
              <span className="text-[15px] font-semibold text-[var(--primary)]">Owner Review</span>
              <p className="text-[13px] text-[var(--text-secondary)] mt-2 leading-relaxed">Presented on screen with previous balance and incoming delta.</p>
            </div>
            <div className="flex flex-col items-center lg:items-start lg:pl-6 lg:border-l border-[var(--border)]">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">04 Action</span>
              <span className="text-[15px] font-semibold text-[var(--text-primary)]">Single Tap</span>
              <p className="text-[13px] text-[var(--text-secondary)] mt-2 leading-relaxed">Clear human approval committing the inward or outward movement.</p>
            </div>
            <div className="flex flex-col items-center lg:items-start lg:pl-6 lg:border-l border-[var(--border)]">
              <span className="text-[11px] font-bold text-[var(--success)] uppercase tracking-wider mb-2">05 Integrity</span>
              <span className="text-[15px] font-semibold text-[var(--success)]">Immutable Record</span>
              <p className="text-[13px] text-[var(--text-secondary)] mt-2 leading-relaxed">Permanent audit entry stamped with operator name and timestamp.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

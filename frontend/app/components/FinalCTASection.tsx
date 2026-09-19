import React from 'react';

export default function FinalCTASection() {
  return (
    <section className="w-full py-24 bg-[#111318] text-white">
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-[11px] uppercase tracking-wider text-[#8E95A2] font-bold block mb-4">Direct Implementation</span>
          <h2 className="text-[36px] sm:text-[44px] leading-[1.1] font-semibold text-white mb-6 tracking-tight">
            Make inventory as simple as saying it.
          </h2>
          <p className="text-lg text-[#8E95A2] mb-10 leading-relaxed">
            Built for wholesale traders, kirana owners, and physical distributors who need ledger accuracy without typing. Let your inventory keep up with the way you work.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button className="bg-[var(--primary)] text-white text-sm font-semibold px-8 py-3.5 rounded hover:bg-[var(--primary-hover)] transition-colors text-center shadow-sm">
              Get Started
            </button>
            <button className="bg-[#1a1c23] text-white border border-[#2d313b] text-sm font-semibold px-8 py-3.5 rounded hover:bg-[#252830] transition-colors text-center">
              Explore VoiceMate
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

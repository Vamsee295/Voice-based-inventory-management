import React from 'react';

export default function OperationalRibbon() {
  return (
    <section className="w-full bg-[var(--surface)] py-2">
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8">
        <div className="flex flex-wrap items-center justify-between text-[var(--text-tertiary)] text-[11px] font-semibold uppercase tracking-wider py-1">
          <span className="text-[var(--primary)] tracking-normal">OPERATIONAL DISCIPLINE</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[var(--text-primary)]">SPEAK</span>
            <span className="text-[var(--border-highest)]">──</span>
            <span className="text-[var(--text-primary)]">UNDERSTAND</span>
            <span className="text-[var(--border-highest)]">──</span>
            <span className="text-[var(--text-primary)]">VALIDATE</span>
            <span className="text-[var(--border-highest)]">──</span>
            <span className="text-[var(--text-primary)]">CONFIRM</span>
            <span className="text-[var(--border-highest)]">──</span>
            <span className="text-[var(--text-primary)]">RECORD</span>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--surface)] border-t border-[var(--border)] pt-16">
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-[var(--border)]">
          <div className="space-y-4">
            <span className="text-lg font-semibold text-[var(--text-primary)]">VoiceMate</span>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Voice-first inventory for the way small businesses actually work. Archival precision for physical inventory operations.
            </p>
          </div>
          <div>
            <span className="text-[11px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider block mb-4">Platform</span>
            <ul className="space-y-3">
              <li><a href="#" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Acoustic Logbooks</a></li>
              <li><a href="#" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Ledger Reconciliation</a></li>
              <li><a href="#" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Batch Auditing</a></li>
            </ul>
          </div>
          <div>
            <span className="text-[11px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider block mb-4">Governance</span>
            <ul className="space-y-3">
              <li><a href="#" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Audit Integrity</a></li>
              <li><a href="#" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">System Security</a></li>
              <li><a href="#" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Data Retention</a></li>
            </ul>
          </div>
          <div>
            <span className="text-[11px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider block mb-4">Organization</span>
            <ul className="space-y-3">
              <li><a href="#" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Documentation</a></li>
              <li><a href="#" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Operational Logs</a></li>
              <li><a href="#" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Direct Support</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-semibold text-[var(--text-tertiary)]">© {new Date().getFullYear()} VoiceMate Systems Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)]">Standard Protocol v4.2</span>
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)]">System Operative</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border-highest)]">
      <div className="h-16 max-w-[1240px] mx-auto px-4 lg:px-8 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-medium text-[var(--text-primary)] tracking-tight">VoiceMate</span>
          <span className="text-[11px] font-semibold text-[var(--text-tertiary)] tracking-wide uppercase">Inventory Intelligence</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors">Product</a>
          <a href="#" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">How it works</a>
          <a href="#" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Capabilities</a>
          <a href="#" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Use Cases</a>
        </nav>
        <div className="flex items-center gap-4">
          <a href="/home" className="hidden sm:block text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Sign in</a>
          <a href="#" className="inline-flex items-center justify-center bg-[var(--primary)] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}

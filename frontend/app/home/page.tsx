'use client';

import Sidebar from './components/Sidebar';
import AppHeader from './components/AppHeader';
import ShiftJournalStream from './components/ShiftJournalStream';
import NeedsAttention from './components/NeedsAttention';
import IndianTradeUnitReference from './components/IndianTradeUnitReference';
import VoiceWorkspace from './components/VoiceWorkspace';

export default function HomePage() {
  return (
    <div className="flex h-screen bg-[var(--background)] font-sans text-[var(--text-primary)] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader
          title="Voice Console"
          description="Natural language → verified inventory actions"
        />

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col xl:flex-row gap-0 min-h-full">

            {/* ── Main Pipeline Panel ── */}
            <main className="flex-1 min-w-0 p-4 lg:p-6">
              <VoiceWorkspace />
            </main>

            {/* ── Right Rail ── */}
            <aside className="w-full xl:w-[320px] shrink-0 border-t xl:border-t-0 xl:border-l border-[var(--border)] bg-[var(--surface-inset)] p-4 overflow-y-auto">
              <ShiftJournalStream />
              <NeedsAttention />
              <IndianTradeUnitReference />
            </aside>

          </div>
        </div>
      </div>
    </div>
  );
}

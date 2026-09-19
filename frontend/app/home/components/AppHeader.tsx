'use client';

import { useState, useEffect } from 'react';
import { useInventoryStore } from '../useInventoryStore';

const STATUS_LABELS: Record<string, string> = {
  IDLE: 'Voice Ready',
  LISTENING: 'Mic Active',
  TRANSCRIBING: 'Transcribing...',
  UNDERSTANDING: 'Interpreting...',
  VALIDATING: 'Validating...',
  DISAMBIGUATING: 'Needs Clarification',
  REVIEW: 'Review Required',
  EXECUTING: 'Committing...',
  COMPLETED: 'Transaction Committed',
  ERROR: 'Pipeline Error',
};

const STATUS_COLORS: Record<string, string> = {
  IDLE: 'text-[#5F6673] bg-[#F4F4F1] border-[#E5E5E0]',
  LISTENING: 'text-[#2457FF] bg-[#EEF2FF] border-[#2457FF]/30',
  TRANSCRIBING: 'text-[#B45309] bg-[#FEF8ED] border-[#B45309]/30',
  UNDERSTANDING: 'text-[#B45309] bg-[#FEF8ED] border-[#B45309]/30',
  VALIDATING: 'text-[#B45309] bg-[#FEF8ED] border-[#B45309]/30',
  DISAMBIGUATING: 'text-[#C2410C] bg-[#FEF2ED] border-[#C2410C]/30',
  REVIEW: 'text-[#2457FF] bg-[#EEF2FF] border-[#2457FF]/30',
  EXECUTING: 'text-[#16794A] bg-[#E8F4EC] border-[#16794A]/30',
  COMPLETED: 'text-[#16794A] bg-[#E8F4EC] border-[#16794A]/30',
  ERROR: 'text-[#C2410C] bg-[#FEF2ED] border-[#C2410C]/30',
};

interface AppHeaderProps {
  customStatus?: string;
}

export default function AppHeader({ customStatus }: AppHeaderProps) {
  const storeStatus = useInventoryStore((s) => s.voice.status);
  const status = customStatus || storeStatus;

  const [currentTime, setCurrentTime] = useState('');
  const [profile, setProfile] = useState<{name: string, businessName: string} | null>(null);

  useEffect(() => {
    // Clock
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    // Fetch user profile
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setProfile(data);
      })
      .catch(console.error);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-13 bg-[#FFFFFF] border-b border-[#E5E5E0] px-5 flex items-center justify-between gap-4 shrink-0">
      {/* Left: Console Title with Enhanced Hierarchy */}
      <div className="flex items-center gap-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[14px] font-bold text-[#111318] tracking-tight">Voice Console</h1>
            <span
              className={`text-[9px] font-bold font-mono tracking-widest uppercase px-2 py-0.5 rounded border ${
                STATUS_COLORS[status] ?? STATUS_COLORS.IDLE
              }`}
            >
              {STATUS_LABELS[status] ?? status}
            </span>
          </div>
          <p className="text-[11px] text-[#5F6673] mt-0.2">
            Natural language → verified inventory actions
          </p>
        </div>
      </div>

      {/* Right: Runtime indicators */}
      <div className="flex items-center gap-3">
        {/* Mic readiness */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F4F4F1] border border-[#E5E5E0] rounded">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16794A] animate-pulse"></span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#111318]">Mic Ready</span>
          <span className="text-[10px] font-mono text-[#5F6673] border-l border-[#E5E5E0] pl-1.5">-42 dB</span>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined text-[16px] text-[#8E95A2] absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search records, SKUs..."
            className="w-48 bg-[#F4F4F1] border border-[#E5E5E0] rounded pl-7 pr-9 py-1 text-[12px] text-[#111318] placeholder:text-[#8E95A2] focus:outline-none focus:border-[#2457FF]"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono font-semibold text-[#5F6673] border border-[#E5E5E0] px-1 rounded bg-white pointer-events-none">
            ⌘K
          </span>
        </div>

        {/* Sync state */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 border border-[#C6E5D6] bg-[#E8F4EC] text-[#16794A] rounded text-[10px] font-bold tracking-widest uppercase font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16794A]"></span>
          Synced
        </div>

        {/* User avatar and name */}
        <div className="flex items-center gap-2 cursor-pointer relative group">
          <div className="flex flex-col items-end">
            <span className="text-[12px] font-bold text-[#111318]">{profile ? profile.name : 'Operator'}</span>
            <span className="text-[10px] text-[#5F6673]">{profile ? profile.businessName : 'Connecting...'}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#2457FF] flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-[12px] font-bold">
              {profile ? profile.name.charAt(0).toUpperCase() : 'O'}
            </span>
          </div>
          <div className="absolute right-0 top-10 w-32 bg-white border border-[#E5E5E0] rounded shadow-md hidden group-hover:flex flex-col">
            <button 
              onClick={() => {
                fetch('/api/auth/logout', { method: 'POST' }).then(() => window.location.href = '/login');
              }}
              className="text-[12px] text-left px-4 py-2 hover:bg-[#F4F4F1] text-[#C2410C]"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import { DEMO_SESSIONS, DemoSession } from '../demoData';

interface ShopFloorTestProps {
  currentSessionId: string;
  onSelectSession: (session: DemoSession) => void;
}

export default function ShopFloorTest({ currentSessionId, onSelectSession }: ShopFloorTestProps) {
  const sessions = Object.values(DEMO_SESSIONS);

  return (
    <div className="border border-[#E5E5E0] rounded-md overflow-hidden bg-[#FAFAF8]">
      {/* Compact Toolbar Header */}
      <div className="px-3.5 py-2 border-b border-[#ECECE8] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[13px] text-[#8E95A2]">play_circle</span>
          <span className="text-[9px] font-bold tracking-widest uppercase text-[#8E95A2]">
            Shop-Floor Test Scenarios
          </span>
        </div>
        <span className="text-[9px] text-[#8E95A2]">Select preset to simulate</span>
      </div>

      {/* Compact Preset Row */}
      <div className="px-3 py-2 flex flex-wrap gap-1.5">
        {sessions.map((item) => {
          const isSelected = item.id === currentSessionId;
          let tagColor = 'text-[#16794A]';
          if (item.tag.includes('MULTI')) tagColor = 'text-[#2457FF]';
          if (item.tag.includes('COUNTER')) tagColor = 'text-[#C2410C]';
          if (item.tag.includes('DISAMBIGUATION')) tagColor = 'text-[#B45309]';

          return (
            <button
              key={item.id}
              onClick={() => onSelectSession(item)}
              title={`"${item.phrase}"`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-left transition-all ${
                isSelected
                  ? 'bg-[#EEF2FF] border-[#2457FF] ring-1 ring-[#2457FF] shadow-sm'
                  : 'bg-[#FFFFFF] border-[#E5E5E0] hover:bg-[#F4F4F1] hover:border-[#D1D5DB]'
              }`}
            >
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#2457FF] shrink-0" />
              )}
              <span className={`text-[9px] font-bold tracking-wider uppercase ${tagColor}`}>
                {item.tag}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

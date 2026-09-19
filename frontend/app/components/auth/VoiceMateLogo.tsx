import React from 'react';

interface VoiceMateLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  showAuditedCore?: boolean;
  align?: 'left' | 'center';
}

export default function VoiceMateLogo({
  size = 'md',
  showSubtitle = true,
  showAuditedCore = false,
  align = 'left',
}: VoiceMateLogoProps) {
  const isCenter = align === 'center';

  return (
    <div className={`flex flex-col ${isCenter ? 'items-center text-center' : 'items-start text-left'}`}>
      <div className="flex items-center gap-3">
        {/* 5-bar Waveform Icon */}
        <div className="flex items-center gap-[3px] h-9 px-1">
          <span className="w-[3.5px] h-[14px] bg-[#2457FF] rounded-full animate-pulse" style={{ animationDuration: '2.4s' }} />
          <span className="w-[3.5px] h-[22px] bg-[#2457FF] rounded-full" />
          <span className="w-[3.5px] h-[34px] bg-[#2457FF] rounded-full" />
          <span className="w-[3.5px] h-[22px] bg-[#2457FF] rounded-full" />
          <span className="w-[3.5px] h-[14px] bg-[#2457FF] rounded-full animate-pulse" style={{ animationDuration: '2.4s' }} />
        </div>

        {/* Text */}
        <div className="flex items-baseline">
          <span className={`font-bold tracking-tight text-slate-900 ${
            size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl'
          }`}>
            Voice<span className="text-[#2457FF]">Mate</span>
          </span>
        </div>
      </div>

      {showSubtitle && (
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em] mt-1 pl-[2px]">
          Inventory Intelligence
        </span>
      )}

      {showAuditedCore && (
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.22em] mt-1.5">
          AUDITED CORE
        </span>
      )}
    </div>
  );
}

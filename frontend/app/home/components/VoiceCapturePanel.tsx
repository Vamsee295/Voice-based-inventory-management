'use client';

import { useState } from 'react';
import ConfidenceIndicator from './ConfidenceIndicator';

interface VoiceCapturePanelProps {
  language: string;
  confidence: number;
  onSimulateListen?: () => void;
  isListening?: boolean;
}

export default function VoiceCapturePanel({
  language,
  confidence,
  onSimulateListen,
  isListening = false,
}: VoiceCapturePanelProps) {
  const [internalListening, setInternalListening] = useState(false);
  const active = isListening || internalListening;

  const toggleListen = () => {
    if (onSimulateListen) {
      onSimulateListen();
    } else {
      setInternalListening((prev) => !prev);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-md overflow-hidden mb-3">
      {/* Stage Header */}
      <div className="px-4 py-2 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] font-bold tracking-widest uppercase text-[#8E95A2] bg-[#FFFFFF] border border-[#E5E5E0] px-2 py-0.5 rounded-sm font-mono">
            01
          </span>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#111318]">
            CAPTURE
          </span>
          <span className="text-[10px] text-[#8E95A2] font-medium">· Acoustic Input</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-[#5F6673]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-[#C2410C] animate-pulse' : 'bg-[#16794A]'}`}
            />
            <span className="font-semibold text-[#111318]">
              {active ? 'Capturing...' : 'Mic Standby'}
            </span>
            <span className="text-[#8E95A2]">(-42 dB)</span>
          </div>
          <span className="text-[9px] font-mono text-[#8E95A2] bg-[#FFFFFF] border border-[#E5E5E0] px-1.5 py-0.5 rounded">
            VAD: Auto-Trigger
          </span>
        </div>
      </div>

      {/* Main Mic & Waveform Area */}
      <div className="p-3.5 flex items-center gap-4">
        {/* Primary Mic Button */}
        <div className="flex flex-col items-center shrink-0">
          <button
            onClick={toggleListen}
            aria-label={active ? 'Stop Listening' : 'Start Listening'}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              active
                ? 'bg-[#C2410C] hover:bg-[#9A3412] text-white shadow-md ring-4 ring-[#C2410C]/20 scale-105'
                : 'bg-[#2457FF] hover:bg-[#003ED7] text-white shadow hover:shadow-md'
            } active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#2457FF]/50`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {active ? 'stop' : 'mic'}
            </span>
          </button>
          <span className="text-[9px] font-bold text-[#5F6673] uppercase tracking-wider mt-1">
            {active ? 'Listening...' : 'Tap to Speak'}
          </span>
        </div>

        {/* Acoustic Waveform */}
        <div className="flex-1 bg-[#F9F9F7] border border-[#E5E5E0] rounded px-3 py-2 flex flex-col justify-center gap-1.5">
          <div className="flex items-center justify-between text-[10px] text-[#8E95A2]">
            <span className="font-semibold uppercase tracking-wider text-[9px] text-[#5F6673]">
              Acoustic Spectrum
            </span>
            <span>{active ? 'Capturing utterance frame...' : 'Waiting for voice trigger...'}</span>
          </div>
          <div className="flex items-end justify-between gap-0.5 h-6">
            {[6, 12, 18, 10, 22, 16, 26, 14, 20, 28, 15, 24, 12, 19, 11, 25, 14, 8, 16, 9, 15, 7].map(
              (height, idx) => (
                <div
                  key={idx}
                  className={`w-full rounded-sm transition-all duration-150 ${
                    active ? 'bg-[#2457FF]' : 'bg-[#D6D6D0]'
                  }`}
                  style={{
                    height: active ? `${Math.max(4, height)}px` : '3px',
                    opacity: active ? 0.85 : 0.5,
                  }}
                />
              )
            )}
          </div>
        </div>

        {/* Dialect & Confidence Metadata */}
        <div className="w-44 shrink-0 flex flex-col gap-1.5 bg-[#F4F4F1] border border-[#E5E5E0] rounded p-2.5">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#8E95A2] block">
              Dialect Model
            </span>
            <span className="text-[11px] font-semibold text-[#111318] block leading-tight">
              {language}
            </span>
          </div>
          <div className="pt-1 border-t border-[#E5E5E0]">
            <ConfidenceIndicator confidence={confidence} label="Confidence" />
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useInventoryStore } from '../useInventoryStore';

const SAMPLES = [
  { text: 'Rice rendu bags vachayi', label: 'Inward', tag: 'Voice Inward', color: 'text-[#16794A]' },
  { text: 'Rice rendu bags vachayi, Freedom oil rendu dabba pettandi', label: 'Multi-item', tag: 'Multi-Item', color: 'text-[#2457FF]' },
  { text: '5 biscuits ammamu', label: 'Sale Out', tag: 'Voice Counter', color: 'text-[#C2410C]' },
  { text: 'Toor dal okka quintal vachindi', label: 'Wholesale In', tag: 'Bulk Inward', color: 'text-[#16794A]' },
  { text: 'Freedom oil rendu dabba pettandi', label: 'Disambiguate', tag: 'Tests Disambiguation', color: 'text-[#B45309]' },
];

export default function AcousticTestBar() {
  const { runPipeline, setVoiceStatus, setTranscript, resetVoice, voice } = useInventoryStore();

  const handleSample = (text: string) => {
    resetVoice();
    setTimeout(() => {
      setVoiceStatus('LISTENING');
      setTimeout(() => {
        setTranscript(text, 'Telugu + Indian English', 0.984);
        runPipeline(text);
      }, 400);
    }, 50);
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-[#5F6673]">play_circle</span>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#111318]">Shop-Floor Acoustic Test</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#8E95A2]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16794A]"></span>
          IA Latency: &lt;180ms
        </div>
      </div>

      <div className="px-4 py-3 flex flex-wrap gap-2">
        {SAMPLES.map((sample) => (
          <button
            key={sample.text}
            onClick={() => handleSample(sample.text)}
            disabled={['LISTENING', 'TRANSCRIBING', 'UNDERSTANDING', 'VALIDATING', 'EXECUTING'].includes(voice.status)}
            className={`group flex flex-col items-start px-3 py-2 rounded border border-[#E5E5E0] bg-[#F4F4F1] hover:bg-[#EEEEEB] hover:border-[#D1D5DB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left`}
          >
            <span className={`text-[9px] font-bold tracking-wider uppercase mb-0.5 ${sample.color}`}>{sample.tag}</span>
            <span className="text-[11px] text-[#111318] italic">"{sample.text}"</span>
          </button>
        ))}
      </div>
    </div>
  );
}

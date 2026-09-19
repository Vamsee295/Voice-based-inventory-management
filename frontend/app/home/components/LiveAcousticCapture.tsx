'use client';

import { useEffect, useRef, useState } from 'react';
import { useInventoryStore } from '../useInventoryStore';

const SAMPLE_PHRASES = [
  { text: 'Rice rendu bags vachayi', label: 'Inward', color: 'text-[#16794A]' },
  { text: 'Rice rendu bags vachayi, Freedom oil rendu dabba pettandi', label: 'Multi-item', color: 'text-[#2457FF]' },
  { text: '5 biscuits ammamu', label: 'Sale', color: 'text-[#C2410C]' },
  { text: 'Toor dal okka quintal vachindi', label: 'Inward', color: 'text-[#16794A]' },
  { text: 'How much oil undi?', label: 'Query', color: 'text-[#B45309]' },
];

export default function LiveAcousticCapture() {
  const { voice, setTranscript, setVoiceStatus, runPipeline, resetVoice } = useInventoryStore();
  const [bars, setBars] = useState<number[]>(Array(16).fill(4));
  const [localTranscript, setLocalTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate audio bars while listening
  useEffect(() => {
    if (voice.status === 'LISTENING') {
      animRef.current = setInterval(() => {
        setBars(Array.from({ length: 16 }, () => Math.floor(4 + Math.random() * 28)));
      }, 80);
    } else {
      if (animRef.current) clearInterval(animRef.current);
      setBars(Array(16).fill(4));
    }
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [voice.status]);

  // Web Speech API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-IN';
    recognitionRef.current = rec;

    rec.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      const heard = final || interim;
      setLocalTranscript(heard);
      if (final) {
        setTranscript(final, 'Telugu + Indian English', e.results[0]?.[0]?.confidence ?? 0.95);
        runPipeline(final);
      }
    };

    rec.onerror = () => {
      setVoiceStatus('ERROR');
    };
  }, []);

  const startListening = () => {
    setLocalTranscript('');
    setVoiceStatus('LISTENING');
    try { recognitionRef.current?.start(); } catch (_) { /* already started */ }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setVoiceStatus('IDLE');
  };

  const handleSamplePhrase = (phrase: string) => {
    setLocalTranscript('');
    setVoiceStatus('LISTENING');
    setTimeout(() => {
      setTranscript(phrase, 'Telugu + Indian English', 0.984);
      runPipeline(phrase);
    }, 500);
  };

  const isActive = voice.status === 'LISTENING';
  const hasTranscript = !!voice.transcript;

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden mb-4">
      {/* Panel Header */}
      <div className="px-4 py-2.5 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-[#5F6673]">graphic_eq</span>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#111318]">Live Acoustic Capture & Dialect Model</span>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#2457FF] bg-[#EEF2FF] px-2 py-0.5 rounded border border-[#2457FF]/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2457FF] animate-pulse"></span>Recording
            </span>
          )}
          <span className="text-[10px] font-semibold text-[#5F6673] bg-[#FFFFFF] border border-[#E5E5E0] px-2 py-0.5 rounded">VAD: Ultra-Low Latency</span>
        </div>
      </div>

      <div className="p-4">
        {/* Waveform & Mic Button */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={isActive ? stopListening : startListening}
            disabled={!['IDLE', 'LISTENING', 'COMPLETED', 'ERROR'].includes(voice.status)}
            className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              isActive
                ? 'bg-[#C2410C] hover:bg-[#9A3412] shadow-md'
                : 'bg-[#2457FF] hover:bg-[#003ED7] shadow-sm'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="material-symbols-outlined text-white text-[28px]">
              {isActive ? 'stop' : 'mic'}
            </span>
          </button>

          {/* Audio bars */}
          <div className="flex-1 flex items-end justify-between gap-0.5 h-10 px-2 py-1 bg-[#F4F4F1] border border-[#E5E5E0] rounded">
            {bars.map((h, i) => (
              <div
                key={i}
                className={`w-full rounded-sm transition-all duration-75 ${isActive ? 'bg-[#2457FF]' : 'bg-[#D1D5DB]'}`}
                style={{ height: `${isActive ? h : 4}px`, minHeight: '4px', maxHeight: '32px' }}
              />
            ))}
          </div>

          {/* Metadata */}
          <div className="flex flex-col gap-1 text-right">
            <div>
              <p className="text-[9px] font-bold text-[#8E95A2] uppercase tracking-wider">Language</p>
              <p className="text-[11px] font-semibold text-[#111318]">{voice.detectedLanguage}</p>
            </div>
            {voice.transcriptConfidence > 0 && (
              <div>
                <p className="text-[9px] font-bold text-[#8E95A2] uppercase tracking-wider">Confidence</p>
                <p className="text-[12px] font-bold text-[#16794A]">{(voice.transcriptConfidence * 100).toFixed(1)}%</p>
              </div>
            )}
          </div>
        </div>

        {/* Ingested utterance buffer */}
        {(voice.transcript || localTranscript) && (
          <div className="mb-4 px-3 py-2.5 bg-[#F4F4F1] border border-[#E5E5E0] rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold text-[#8E95A2] uppercase tracking-widest">Ingested Utterance Buffer</span>
              <span suppressHydrationWarning className="text-[9px] font-semibold text-[#5F6673] bg-[#FFFFFF] border border-[#E5E5E0] px-1.5 py-0.5 rounded">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <p className="text-[15px] text-[#111318] italic">"{voice.transcript || localTranscript}"</p>
            <p className="text-[11px] text-[#5F6673] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">translate</span>
              Detected: {voice.detectedLanguage} · Tokenised to Acoustic Chunks
            </p>
          </div>
        )}

        {/* Pipeline stage sub-label */}
        {!['IDLE', 'LISTENING'].includes(voice.status) && (
          <div className="mb-3 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-[#2457FF] border-t-transparent animate-spin"></div>
            <span className="text-[12px] text-[#5F6673]">
              {voice.status === 'TRANSCRIBING' && 'Converting speech to text...'}
              {voice.status === 'UNDERSTANDING' && 'Detecting intent and entities...'}
              {voice.status === 'VALIDATING' && 'Normalising units & validating against master SKU table...'}
              {voice.status === 'DISAMBIGUATING' && 'Multiple SKU matches found. Awaiting disambiguation...'}
              {voice.status === 'REVIEW' && 'Extraction complete. Review required before commit.'}
              {voice.status === 'EXECUTING' && 'Committing to master ledger...'}
              {voice.status === 'COMPLETED' && '✓ Transaction committed to ledger.'}
              {voice.status === 'ERROR' && `⚠ Pipeline error: ${voice.errorMessage}`}
            </span>
          </div>
        )}

        {/* Controls row */}
        <div className="flex items-center gap-2">
          {voice.status === 'IDLE' && (
            <button onClick={startListening} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-[#2457FF] text-white rounded hover:bg-[#003ED7] transition-colors">
              <span className="material-symbols-outlined text-[14px]">mic</span>
              Start Listening
            </button>
          )}
          {isActive && (
            <button onClick={stopListening} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-[#C2410C] text-white rounded hover:bg-[#9A3412] transition-colors">
              <span className="material-symbols-outlined text-[14px]">stop</span>
              Stop Listening
            </button>
          )}
          {['COMPLETED', 'ERROR'].includes(voice.status) && (
            <button onClick={resetVoice} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-[#F4F4F1] text-[#111318] border border-[#E5E5E0] rounded hover:bg-[#EEEEEB] transition-colors">
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              New Command
            </button>
          )}
          <span className="text-[10px] text-[#8E95A2]">· VAD Mode: Ultra-Low Latency Auto-Trigger</span>
        </div>
      </div>
    </div>
  );
}

// Export sample phrases for the bottom test bar
export { SAMPLE_PHRASES };

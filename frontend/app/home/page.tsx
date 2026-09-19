'use client';

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import AppHeader from './components/AppHeader';
import ShiftJournalStream from './components/ShiftJournalStream';
import NeedsAttention from './components/NeedsAttention';
import IndianTradeUnitReference from './components/IndianTradeUnitReference';
import { useVoicePipeline, VoiceState } from './useVoicePipeline';
import { Mic, MicOff, Square, Send, CheckCircle2, AlertTriangle, Loader2, RefreshCw, ArrowRight, Volume2 } from 'lucide-react';

const STATE_LABEL: Record<VoiceState, string> = {
  IDLE: 'Ready',
  RECORDING: 'Listening...',
  UPLOADING: 'Uploading audio...',
  TRANSCRIBING: 'Transcribing with Groq Whisper...',
  UNDERSTANDING: 'Understanding command...',
  RETRIEVING_CONTEXT: 'Retrieving context...',
  VERIFYING: 'Verifying inventory impact...',
  READY: 'Ready to Apply',
  COMMITTING: 'Committing transaction...',
  COMMITTED: 'Transaction Committed',
  ERROR: 'Error',
};

const PROCESSING_STATES: VoiceState[] = ['UPLOADING', 'TRANSCRIBING', 'UNDERSTANDING', 'RETRIEVING_CONTEXT', 'VERIFYING', 'COMMITTING'];

export default function HomePage() {
  const {
    state, result, isRecording, isProcessing, isReady, isCommitted, isError,
    checkMicSupport, startListening, stopListening, processTypedCommand, confirmAndApply, reset,
  } = useVoicePipeline();

  const [textInput, setTextInput] = useState('');

  const handleMicClick = () => {
    if (isRecording) {
      stopListening();
    } else if (state === 'IDLE' || isError) {
      startListening();
    }
  };

  const handleRunCommand = async () => {
    if (!textInput.trim()) return;
    const cmd = textInput;
    setTextInput('');
    await processTypedCommand(cmd);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRunCommand();
    }
  };

  const micSupported = checkMicSupport();

  // Status badge
  const statusBadge = () => {
    if (state === 'COMMITTED') return { text: 'COMMITTED', cls: 'bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/20' };
    if (state === 'READY') return { text: 'REVIEW REQUIRED', cls: 'bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/20' };
    if (isError) return { text: 'ERROR', cls: 'bg-[var(--danger)]/15 text-[var(--danger)] border-[var(--danger)]/20' };
    if (isRecording) return { text: 'RECORDING', cls: 'bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/20' };
    if (isProcessing) return { text: 'PROCESSING', cls: 'bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/20' };
    return { text: 'READY', cls: 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/10' };
  };

  const badge = statusBadge();

  return (
    <div className="flex h-screen bg-[var(--background)] font-sans text-[var(--text-primary)] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader
          title="Voice Console"
          description="Natural language → verified inventory actions"
          statusBadge={
            <span className={`text-[10px] font-semibold tracking-widest uppercase border px-2.5 py-1 rounded-full ${badge.cls}`}>
              {badge.text}
            </span>
          }
        />

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col xl:flex-row gap-0 min-h-full">

            {/* ── Main Pipeline Panel ── */}
            <main className="flex-1 min-w-0 p-4 lg:p-6 space-y-5">

              {/* Voice Input Panel */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="p-5 border-b border-[var(--border)] flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">Tell VoiceMate what happened.</p>
                    <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Speak naturally in English, Telugu or Tenglish.</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-semibold tracking-widest uppercase border px-2.5 py-1 rounded-full ${badge.cls}`}>
                    {badge.text}
                  </span>
                </div>

                {/* Mic button */}
                <div className="flex flex-col items-center py-8 gap-3">
                  <button
                    onClick={handleMicClick}
                    disabled={isProcessing || isCommitted}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg
                      ${isRecording
                        ? 'bg-[var(--danger)] hover:bg-red-600 ring-4 ring-[var(--danger)]/30 animate-pulse'
                        : isProcessing || isCommitted
                        ? 'bg-[var(--surface-low)] text-[var(--text-muted)] cursor-not-allowed'
                        : 'bg-[var(--surface-low)] hover:bg-[var(--primary)] hover:text-white text-[var(--text-secondary)] border border-[var(--border)] hover:border-transparent'
                      }`}
                  >
                    {isRecording
                      ? <Square className="w-6 h-6 text-white" />
                      : isProcessing
                      ? <Loader2 className="w-6 h-6 animate-spin" />
                      : <Mic className="w-6 h-6" />
                    }
                  </button>

                  <p className="text-[12px] font-medium text-[var(--text-muted)] tracking-wide uppercase">
                    {isRecording ? 'Tap to Stop' : isProcessing ? STATE_LABEL[state] : 'Tap to Speak'}
                  </p>

                  {!micSupported && (
                    <p className="text-[11px] text-[var(--warning)] text-center max-w-xs">
                      MediaRecorder not supported in this browser. Please use Chrome or Firefox.
                    </p>
                  )}
                </div>

                {/* Separator */}
                <div className="flex items-center gap-3 px-5 pb-4">
                  <div className="flex-1 h-[1px] bg-[var(--divider)]" />
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">OR</span>
                  <div className="flex-1 h-[1px] bg-[var(--divider)]" />
                </div>

                {/* Text input */}
                <div className="flex gap-2 px-4 pb-5">
                  <input
                    type="text"
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isProcessing || isRecording}
                    placeholder="Type a command... (e.g. Rice rendu bags vachayi)"
                    className="flex-1 bg-[var(--surface-low)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    onClick={handleRunCommand}
                    disabled={!textInput.trim() || isProcessing || isRecording}
                    className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[var(--primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Run
                  </button>
                </div>
              </div>

              {/* Pipeline Progress — when processing */}
              {(isProcessing || isRecording) && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
                    <span className="text-[13px] text-[var(--text-primary)] font-medium">{STATE_LABEL[state]}</span>
                  </div>
                </div>
              )}

              {/* Error state */}
              {isError && (
                <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-[var(--danger)]">Command Failed</p>
                    <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{result.errorMessage}</p>
                  </div>
                  <button onClick={reset} className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1.5 shrink-0">
                    <RefreshCw className="w-3.5 h-3.5" /> Try again
                  </button>
                </div>
              )}

              {/* UNDERSTOOD panel */}
              {result.transcript && !isError && (state !== 'IDLE') && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                  <div className="px-5 pt-4 pb-2 border-b border-[var(--border)]">
                    <p className="text-[10px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">Heard</p>
                    <p className="text-[15px] font-medium text-[var(--text-primary)] mt-1">"{result.transcript}"</p>
                  </div>

                  {result.command && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5">
                      <div>
                        <p className="text-[10px] font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-1">Intent</p>
                        <p className={`text-[13px] font-semibold ${result.command.intent === 'STOCK_IN' ? 'text-[var(--success)]' : result.command.intent === 'STOCK_OUT' ? 'text-[var(--danger)]' : 'text-[var(--primary)]'}`}>
                          {result.command.intent.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-1">Product</p>
                        <p className="text-[13px] font-medium text-[var(--text-primary)]">
                          {result.preview?.product?.name || result.command.product_query || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-1">Quantity</p>
                        <p className="text-[13px] font-medium text-[var(--text-primary)]">
                          {result.command.quantity != null ? `${result.command.quantity} ${result.command.unit || ''}` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-1">Language</p>
                        <p className="text-[13px] font-medium text-[var(--text-primary)] capitalize">{result.command.language || 'Auto-detected'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PREVIEW panel */}
              {result.preview && !isError && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-[var(--border)]">
                    <p className="text-[10px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">Verify Inventory Impact</p>
                  </div>

                  {result.preview.status === 'READY' && (
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[var(--surface-low)] rounded-lg p-3 text-center">
                          <p className="text-[11px] text-[var(--text-muted)] mb-1">Current Stock</p>
                          <p className="text-[18px] font-bold text-[var(--text-primary)]">{result.preview.current_stock}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">{result.preview.base_unit}</p>
                        </div>
                        <div className="bg-[var(--surface-low)] rounded-lg p-3 text-center">
                          <p className="text-[11px] text-[var(--text-muted)] mb-1">Change</p>
                          <p className={`text-[18px] font-bold ${(result.preview.normalized_quantity || 0) >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                            {(result.preview.normalized_quantity || 0) >= 0 ? '+' : ''}{result.preview.normalized_quantity}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)]">{result.preview.base_unit}</p>
                        </div>
                        <div className="bg-[var(--surface-low)] rounded-lg p-3 text-center">
                          <p className="text-[11px] text-[var(--text-muted)] mb-1">Projected Stock</p>
                          <p className="text-[18px] font-bold text-[var(--primary)]">{result.preview.projected_stock}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">{result.preview.base_unit}</p>
                        </div>
                      </div>

                      {result.preview.tune_note && (
                        <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)] bg-[var(--surface-low)] rounded-lg px-3 py-2">
                          <ArrowRight className="w-3.5 h-3.5 shrink-0 text-[var(--primary)]" />
                          <span>TUNE Conversion: {result.preview.tune_note}</span>
                          {result.preview.validation === 'VALID' && (
                            <span className="ml-auto flex items-center gap-1 text-[var(--success)]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Validated
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={reset}
                          className="px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] rounded-lg transition-colors"
                        >
                          Discard
                        </button>
                        <button
                          onClick={confirmAndApply}
                          className="flex-1 flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-2.5 rounded-lg text-[13px] font-semibold transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Confirm & Apply
                        </button>
                      </div>
                    </div>
                  )}

                  {result.preview.status !== 'READY' && (
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-[var(--warning)] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[13px] font-semibold text-[var(--text-primary)]">{result.preview.status.replace(/_/g, ' ')}</p>
                          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{result.preview.message}</p>
                          {result.preview.candidates && result.preview.candidates.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                              <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">Select product:</p>
                              {result.preview.candidates.map(c => (
                                <button key={c.id} className="block w-full text-left px-3 py-2 bg-[var(--surface-low)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-md text-[13px] text-[var(--text-primary)]">
                                  {c.name} <span className="text-[var(--text-muted)]">({c.sku})</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button onClick={reset} className="mt-4 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5" /> Try again
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* COMMITTED panel */}
              {isCommitted && result.confirmed && (
                <div className="bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-xl overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[var(--success)]/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[var(--success)]">Transaction Committed</p>
                        <p className="text-[11px] text-[var(--text-muted)] font-mono">ID: {result.confirmed.transaction_id}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[var(--surface)] rounded-lg p-3 text-center">
                        <p className="text-[11px] text-[var(--text-muted)]">Previous</p>
                        <p className="text-[16px] font-bold text-[var(--text-primary)]">{result.confirmed.previous_stock}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{result.confirmed.base_unit}</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-[var(--success)]" />
                      </div>
                      <div className="bg-[var(--surface)] rounded-lg p-3 text-center">
                        <p className="text-[11px] text-[var(--text-muted)]">New Balance</p>
                        <p className="text-[16px] font-bold text-[var(--success)]">{result.confirmed.new_stock}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{result.confirmed.base_unit}</p>
                      </div>
                    </div>
                    <button onClick={reset} className="mt-4 w-full py-2.5 border border-[var(--border)] rounded-lg text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                      New Command
                    </button>
                  </div>
                </div>
              )}
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

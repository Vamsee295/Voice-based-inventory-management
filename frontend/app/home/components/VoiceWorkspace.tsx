'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  Square,
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { useVoicePipeline, VoiceState } from '../useVoicePipeline';

// ---------------------------------------------------------------------------
// Label map for status badge
// ---------------------------------------------------------------------------
const STATE_LABEL: Record<VoiceState, string> = {
  IDLE: 'Ready',
  RECORDING: 'Listening',
  UPLOADING: 'Uploading',
  TRANSCRIBING: 'Transcribing',
  UNDERSTANDING: 'Understanding',
  RETRIEVING_CONTEXT: 'Retrieving Context',
  VERIFYING: 'Verifying',
  READY: 'Review Required',
  COMMITTING: 'Committing',
  COMMITTED: 'Committed',
  ERROR: 'Error',
};

// ---------------------------------------------------------------------------
// Processing overlay label (shown below mic button when working)
// ---------------------------------------------------------------------------
const PROCESSING_LABEL: Record<string, string> = {
  UPLOADING: 'Uploading audio...',
  TRANSCRIBING: 'Transcribing speech...',
  UNDERSTANDING: 'Understanding command...',
  RETRIEVING_CONTEXT: 'Retrieving context...',
  VERIFYING: 'Verifying inventory...',
  COMMITTING: 'Applying to ledger...',
};

// ---------------------------------------------------------------------------
// VoiceWorkspace
// ---------------------------------------------------------------------------
export default function VoiceWorkspace() {
  const {
    state,
    result,
    isRecording,
    isProcessing,
    isReady,
    isCommitted,
    isError,
    lastInputWasTyped,
    checkMicSupport,
    startListening,
    stopListening,
    processTypedCommand,
    selectCandidate,
    confirmAndApply,
    reset,
  } = useVoicePipeline();

  const [textInput, setTextInput] = useState('');
  const [micSupported, setMicSupported] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const tryAgainRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMicSupported(checkMicSupport());
  }, [checkMicSupport]);

  // When entering ERROR state, focus the Try Again button for keyboard accessibility
  useEffect(() => {
    if (isError && tryAgainRef.current) {
      tryAgainRef.current.focus();
    }
  }, [isError]);

  const handleRunCommand = useCallback(() => {
    const cmd = textInput.trim();
    if (!cmd || isProcessing || isRecording || isCommitted) return;
    setTextInput('');
    processTypedCommand(cmd);
  }, [textInput, isProcessing, isRecording, isCommitted, processTypedCommand]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleRunCommand();
      }
      if (e.key === 'Escape') {
        if (isError) reset();
      }
    },
    [handleRunCommand, isError, reset]
  );

  const handleTryAgain = useCallback(() => {
    reset();
    // Give React a tick to clear ERROR state, then focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [reset]);

  // ── Derive badge style ──
  let badgeClass = 'text-[#2457FF] bg-blue-50 border-blue-200';
  let badgeLabel = STATE_LABEL[state];

  if (isCommitted) {
    badgeClass = 'text-[#17824D] bg-emerald-50 border-emerald-200';
  } else if (isRecording) {
    badgeClass = 'text-[#C2410C] bg-red-50 border-red-200 animate-pulse';
  } else if (isError) {
    badgeClass = 'text-[#C2410C] bg-[#FEF2ED] border-[#FDBA74]/60';
  } else if (isReady) {
    badgeClass = 'text-[#B7791F] bg-amber-50 border-amber-200';
  } else if (isProcessing) {
    badgeClass = 'text-[#2457FF] bg-blue-50 border-blue-200';
  } else {
    // IDLE
    badgeClass = 'text-[#626873] bg-[#F7F7F5] border-[#E6E6E1]';
    badgeLabel = 'Voice Ready';
  }

  const canRunCommand =
    textInput.trim().length > 0 && !isProcessing && !isRecording && !isCommitted;

  return (
    <div
      className="bg-white border border-[#E6E6E1] rounded-xl shadow-sm flex flex-col overflow-hidden max-w-4xl mx-auto my-4"
      aria-label="VoiceMate Voice Console"
    >
      {/* ── HEADER ── */}
      <div className="px-6 py-4 border-b border-[#E6E6E1] flex items-center justify-between bg-white">
        <div>
          <h2 className="text-[16px] font-semibold text-[#16181D]">
            Tell VoiceMate what happened.
          </h2>
          <p className="text-[13px] text-[#626873] mt-0.5">
            Speak naturally in English, Telugu or Tenglish.
          </p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${badgeClass}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {badgeLabel}
        </span>
      </div>

      {/* ── CAPTURE ZONE ── */}
      <div className="px-8 py-10 flex flex-col items-center justify-center border-b border-[#EEEEEA] relative">

        {/* Mic Button */}
        <button
          onClick={isRecording ? stopListening : startListening}
          disabled={isProcessing || isCommitted}
          aria-label={isRecording ? 'Stop recording' : 'Tap to speak a command'}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-[#C2410C] text-white shadow-lg shadow-red-200 scale-110 animate-pulse'
              : isProcessing || isCommitted
              ? 'bg-[#F2F2EF] text-[#8A909A] border border-[#E6E6E1] cursor-not-allowed opacity-60'
              : isError
              ? 'bg-[#F2F2EF] text-[#8A909A] border border-[#E6E6E1] hover:border-[#2457FF] hover:text-[#2457FF] transition-colors cursor-pointer'
              : 'bg-[#F2F2EF] text-[#16181D] border border-[#E6E6E1] hover:bg-[#E6E6E1] cursor-pointer'
          }`}
        >
          {isRecording ? (
            <Square className="w-6 h-6 text-white" />
          ) : isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Mic className="w-7 h-7" strokeWidth={2} />
          )}
        </button>

        {/* Mic label */}
        <p
          className={`mt-4 text-[12px] font-semibold tracking-widest uppercase ${
            isRecording
              ? 'text-[#C2410C]'
              : isProcessing
              ? 'text-[#8A909A]'
              : 'text-[#8A909A]'
          }`}
        >
          {isRecording
            ? 'TAP TO STOP'
            : isProcessing
            ? (PROCESSING_LABEL[state] || 'Processing...')
            : 'TAP TO SPEAK'}
        </p>

        {/* Mic unsupported warning */}
        {!micSupported && (
          <p className="text-[11px] text-[#B7791F] mt-2 text-center max-w-xs">
            Microphone is not available in this browser. Please type your command below.
          </p>
        )}

        {/* OR divider */}
        <div className="flex items-center gap-4 my-6 w-full max-w-md">
          <div className="h-px bg-[#EEEEEA] flex-1" />
          <span className="text-[10px] font-bold text-[#8A909A] tracking-widest uppercase">OR</span>
          <div className="h-px bg-[#EEEEEA] flex-1" />
        </div>

        {/* Text Command Input */}
        <div
          className={`w-full max-w-2xl flex shadow-sm rounded-lg border overflow-hidden bg-white transition-all ${
            isError
              ? 'border-[#E6E6E1] focus-within:ring-2 focus-within:ring-[#2457FF] focus-within:border-[#2457FF]'
              : 'border-[#E6E6E1] focus-within:ring-2 focus-within:ring-[#2457FF] focus-within:border-[#2457FF]'
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command... (e.g. Rice rendu bags vachayi)"
            className="flex-1 px-4 py-3 bg-transparent text-[14px] text-[#16181D] focus:outline-none placeholder:text-[#8A909A] disabled:opacity-50"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing || isRecording || isCommitted}
            autoComplete="off"
            aria-label="Type a voice command"
          />
          <button
            onClick={handleRunCommand}
            disabled={!canRunCommand}
            aria-label="Run typed command"
            className="px-6 font-semibold text-[13px] text-white bg-[#2457FF] hover:bg-[#1D49DB] active:bg-[#1740C8] disabled:bg-[#8A909A] disabled:opacity-60 transition-colors flex items-center gap-2 min-w-[120px] justify-center"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Run Command</span>
              </>
            )}
          </button>
        </div>

        {/* Transcript display (non-error states) */}
        {result.transcript && !isError && state !== 'IDLE' && (
          <div className="mt-6 text-center max-w-2xl">
            <p className="text-[18px] font-medium text-[#16181D] leading-snug">
              &ldquo;{result.transcript}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* ── ERROR BANNER ── */}
      {isError && (
        <div
          className="border-b border-[#EEEEEA] bg-[#FFF7F5]"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="px-6 py-4 flex items-start gap-3">
            <AlertTriangle
              className="w-5 h-5 text-[#C2410C] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[#C2410C] leading-tight">
                Command Failed
              </p>
              <p className="text-[13px] text-[#626873] mt-1 leading-snug">
                {result.errorMessage ||
                  'Could not understand the command. Please try speaking or typing clearly.'}
              </p>
            </div>
            <button
              ref={tryAgainRef}
              onClick={handleTryAgain}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#16181D] bg-white border border-[#E6E6E1] rounded-md shadow-sm hover:bg-[#F2F2EF] hover:border-[#2457FF] hover:text-[#2457FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2457FF]"
              aria-label="Try again — clear error and return to idle"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── ANALYSIS ZONE: UNDERSTOOD + VERIFY ── */}
      {(isReady || isCommitted) && result.command && result.preview && (
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#EEEEEA] bg-[#FAFAF8]">

          {/* Understood section */}
          <div className="flex-1 p-6">
            <p className="text-[10px] font-bold text-[#8A909A] tracking-widest uppercase mb-4">
              Understood
            </p>

            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div>
                <p className="text-[11px] text-[#626873] mb-1">Intent</p>
                <span
                  className={`font-semibold text-[14px] ${
                    result.command.intent === 'STOCK_IN'
                      ? 'text-[#17824D]'
                      : result.command.intent === 'STOCK_OUT'
                      ? 'text-[#C2410C]'
                      : 'text-[#2457FF]'
                  }`}
                >
                  {result.command.intent.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <p className="text-[11px] text-[#626873] mb-1">Product</p>
                <p
                  className="font-semibold text-[14px] text-[#16181D] truncate"
                  title={result.preview.product?.name || result.command.product_query || undefined}
                >
                  {result.preview.product?.name || result.command.product_query || '—'}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-[#626873] mb-1">Quantity</p>
                <p className="font-semibold text-[14px] text-[#16181D]">
                  {result.command.quantity != null ? result.command.quantity : '—'}{' '}
                  <span className="text-[#626873] font-normal">{result.command.unit || ''}</span>
                </p>
              </div>

              <div>
                <p className="text-[11px] text-[#626873] mb-1">Language</p>
                <p className="font-medium text-[13px] text-[#16181D] capitalize">
                  {result.command.language || 'Auto-detected'}
                </p>
              </div>
            </div>
          </div>

          {/* Verify section */}
          <div className="flex-1 p-6">
            <p className="text-[10px] font-bold text-[#8A909A] tracking-widest uppercase mb-4">
              Verify Inventory Impact
            </p>

            {result.preview.status === 'READY' ? (
              <>
                <div className="bg-white border border-[#E6E6E1] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-medium text-[#626873]">Current Stock</span>
                    <span className="text-[14px] font-mono text-[#16181D]">
                      {result.preview.current_stock} {result.preview.base_unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#EEEEEA]">
                    <span className="text-[12px] font-medium text-[#626873]">
                      Change (
                      {(result.preview.normalized_quantity || 0) >= 0 ? '+' : ''}
                      {result.preview.normalized_quantity} {result.preview.base_unit})
                    </span>
                    <span
                      className={`text-[14px] font-mono font-semibold ${
                        (result.preview.normalized_quantity || 0) >= 0
                          ? 'text-[#17824D]'
                          : 'text-[#C2410C]'
                      }`}
                    >
                      {(result.preview.normalized_quantity || 0) >= 0 ? '+' : ''}
                      {result.preview.normalized_quantity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#16181D]">
                      Projected Stock
                    </span>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-[#8A909A]" />
                      <span className="text-[15px] font-mono font-bold text-[#16181D]">
                        {result.preview.projected_stock} {result.preview.base_unit}
                      </span>
                    </div>
                  </div>
                </div>

                {result.preview.tune_note && (
                  <div className="mt-3 flex items-center justify-between px-1">
                    <span className="text-[11px] text-[#626873]">
                      TUNE Conversion:{' '}
                      <span className="font-mono">{result.preview.tune_note}</span>
                    </span>
                    {result.preview.validation === 'VALID' && (
                      <span className="flex items-center gap-1 text-[11px] text-[#17824D] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Validated
                      </span>
                    )}
                  </div>
                )}
              </>
            ) : result.preview.status === 'AMBIGUOUS_PRODUCT' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-[#B7791F]" />
                  <span className="text-[13px] font-semibold text-[#16181D]">
                    Multiple products found
                  </span>
                </div>
                <p className="text-[12px] text-[#626873] mb-3">{result.preview.message}</p>
                {result.preview.candidates && result.preview.candidates.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-[#16181D] mb-2">
                      Select matching product:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.preview.candidates.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => selectCandidate(c)}
                          className="px-3 py-1.5 bg-white border border-[#2457FF] text-[#2457FF] font-medium text-[12px] rounded-md hover:bg-[#2457FF] hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <span>{c.name}</span>
                          <span className="text-[10px] opacity-75 font-mono">({c.sku})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-[#B7791F]" />
                  <span className="text-[13px] font-semibold text-[#16181D]">
                    {result.preview.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-[12px] text-[#626873]">{result.preview.message}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ACTION BAR: CONFIRM & APPLY ── */}
      {!isCommitted && isReady && result.preview?.status === 'READY' && (
        <div className="p-4 bg-white border-t border-[#E6E6E1] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#B7791F] px-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[13px] font-medium">Ready to apply</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="px-4 py-2 text-[13px] font-medium text-[#626873] hover:text-[#16181D] transition-colors"
            >
              Discard
            </button>
            <button
              onClick={confirmAndApply}
              className="px-5 py-2 text-[13px] font-semibold text-white bg-[#2457FF] hover:bg-[#1D49DB] rounded-md shadow-sm transition-colors"
            >
              Confirm &amp; Apply
            </button>
          </div>
        </div>
      )}

      {/* ── COMMITTED BANNER ── */}
      {isCommitted && result.confirmed && (
        <div className="p-4 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between py-5">
          <div className="flex items-center gap-2 text-[#17824D] px-4">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[14px] font-semibold">
              Transaction applied to master ledger (ID: {result.confirmed.transaction_id})
            </span>
          </div>
          <button
            onClick={reset}
            className="mr-2 px-5 py-2 text-[13px] font-medium bg-white border border-[#E6E6E1] text-[#16181D] rounded-md shadow-sm hover:bg-[#F2F2EF] transition-colors"
          >
            New Command
          </button>
        </div>
      )}
    </div>
  );
}

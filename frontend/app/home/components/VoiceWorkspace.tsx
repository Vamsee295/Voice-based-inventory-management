'use client';

import { useState, useEffect } from 'react';
import { Mic, Square, Loader2, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Send, AlertTriangle } from 'lucide-react';
import { useVoicePipeline, VoiceState } from '../useVoicePipeline';

const STATE_LABEL: Record<VoiceState, string> = {
  IDLE: 'Voice Ready',
  RECORDING: 'Listening...',
  UPLOADING: 'Uploading...',
  TRANSCRIBING: 'Transcribing...',
  UNDERSTANDING: 'Understanding...',
  RETRIEVING_CONTEXT: 'Context...',
  VERIFYING: 'Verifying...',
  READY: 'Review Required',
  COMMITTING: 'Committing...',
  COMMITTED: 'Transaction Committed',
  ERROR: 'Error',
};

export default function VoiceWorkspace() {
  const {
    state, result, isRecording, isProcessing, isReady, isCommitted, isError,
    checkMicSupport, startListening, stopListening, processTypedCommand, selectCandidate, confirmAndApply, reset,
  } = useVoicePipeline();

  const [textInput, setTextInput] = useState('');
  const [micSupported, setMicSupported] = useState(true);

  useEffect(() => {
    setMicSupported(checkMicSupport());
  }, [checkMicSupport]);

  const handleRunCommand = () => {
    if (!textInput.trim()) return;
    const cmd = textInput;
    setTextInput('');
    processTypedCommand(cmd);
  };
  
  // Status text for the top right
  let statusText = STATE_LABEL[state] || 'Ready';
  let statusColor = 'text-[var(--primary)] bg-[var(--primary)]/10';
  
  if (isCommitted) {
    statusColor = 'text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/20';
  } else if (isRecording) {
    statusColor = 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/20';
  } else if (isError) {
    statusColor = 'text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/20';
  } else if (isReady) {
    statusColor = 'text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/20';
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm flex flex-col overflow-hidden max-w-4xl mx-auto my-4">
      
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)]">
        <div>
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">Tell VoiceMate what happened.</h2>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Speak naturally in English, Telugu or Tenglish.</p>
        </div>
        <div className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${statusColor}`}>
          {statusText}
        </div>
      </div>

      {/* CAPTURE ZONE */}
      <div className="px-8 py-10 flex flex-col items-center justify-center border-b border-[var(--divider)] relative">
        <button 
          onClick={isRecording ? stopListening : startListening}
          disabled={isProcessing || isCommitted}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isRecording 
              ? 'bg-[var(--danger)] text-white shadow-lg shadow-[var(--danger)]/30 scale-110 animate-pulse' 
              : isProcessing || isCommitted
              ? 'bg-[var(--surface-low)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed'
              : 'bg-[var(--surface-low)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--border)]'
          }`}
        >
          {isRecording ? <Square className="w-6 h-6 text-white" /> : isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Mic className="w-7 h-7" strokeWidth={2} />}
        </button>
        
        <p className={`mt-4 text-[12px] font-semibold tracking-widest uppercase ${isRecording ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`}>
          {isRecording ? 'Tap to Stop' : isProcessing ? STATE_LABEL[state] : 'Tap to Speak'}
        </p>

        {!micSupported && (
          <p className="text-[11px] text-[var(--warning)] mt-2">
            Microphone not supported in this browser.
          </p>
        )}

        <div className="flex items-center gap-4 my-6 w-full max-w-md">
          <div className="h-px bg-[var(--divider)] flex-1"></div>
          <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest uppercase">OR</span>
          <div className="h-px bg-[var(--divider)] flex-1"></div>
        </div>

        <div className="w-full max-w-2xl relative flex shadow-sm rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--surface)] focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:border-[var(--primary)] transition-all">
          <input 
            type="text" 
            placeholder="Type a command... (e.g. Rice rendu bags vachayi)"
            className="flex-1 px-4 py-3 bg-transparent text-[14px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-muted)] disabled:opacity-50"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRunCommand();
              }
            }}
            disabled={isProcessing || isRecording || isCommitted}
          />
          <button 
            onClick={handleRunCommand}
            disabled={!textInput.trim() || isProcessing || isRecording || isCommitted}
            className="px-6 font-semibold text-[13px] text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--text-muted)] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isProcessing ? 'Processing...' : 'Run Command'}
          </button>
        </div>

        {result.transcript && !isError && state !== 'IDLE' && (
          <div className="mt-6 text-center max-w-2xl">
            <p className="text-[18px] font-medium text-[var(--text-primary)]">"{result.transcript}"</p>
          </div>
        )}
      </div>

      {/* ERROR ZONE */}
      {isError && (
        <div className="p-6 bg-[var(--danger)]/5 border-b border-[var(--divider)]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[var(--danger)]">Command Failed</p>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1">{result.errorMessage}</p>
            </div>
            <button onClick={reset} className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1.5 px-3 py-1.5 border rounded-md bg-white shadow-sm">
              <RefreshCw className="w-3.5 h-3.5" /> Try again
            </button>
          </div>
        </div>
      )}

      {/* ANALYSIS ZONE (Only when ready or committed) */}
      {(isReady || isCommitted) && result.command && result.preview && (
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[var(--divider)] bg-[var(--surface-low)]/30">
          
          {/* Understood Section */}
          <div className="flex-1 p-6">
            <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest uppercase mb-4">Understood</p>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div>
                <p className="text-[11px] text-[var(--text-secondary)] mb-1">Intent</p>
                <div className="flex items-center gap-1.5">
                  <span className={`font-semibold text-[14px] ${result.command.intent === 'STOCK_IN' ? 'text-[var(--success)]' : result.command.intent === 'STOCK_OUT' ? 'text-[var(--danger)]' : 'text-[var(--primary)]'}`}>
                    {result.command.intent.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-[11px] text-[var(--text-secondary)] mb-1">Product</p>
                <p className="font-semibold text-[14px] text-[var(--text-primary)] truncate" title={result.preview.product?.name || result.command.product_query || undefined}>
                  {result.preview.product?.name || result.command.product_query || '—'}
                </p>
              </div>
              
              <div>
                <p className="text-[11px] text-[var(--text-secondary)] mb-1">Quantity</p>
                <p className="font-semibold text-[14px] text-[var(--text-primary)]">
                  {result.command.quantity != null ? result.command.quantity : '—'} <span className="text-[var(--text-secondary)] font-normal">{result.command.unit || ''}</span>
                </p>
              </div>

              <div>
                <p className="text-[11px] text-[var(--text-secondary)] mb-1">Language</p>
                <p className="font-medium text-[13px] text-[var(--text-primary)] capitalize">{result.command.language || 'Auto-detected'}</p>
              </div>
            </div>
          </div>

          {/* Verify Section */}
          <div className="flex-1 p-6">
            <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest uppercase mb-4">Verify Inventory Impact</p>
            
            {result.preview.status === 'READY' ? (
              <>
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-medium text-[var(--text-secondary)]">Current Stock</span>
                    <span className="text-[14px] font-mono text-[var(--text-primary)]">{result.preview.current_stock}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--divider)]">
                    <span className="text-[12px] font-medium text-[var(--text-secondary)]">Change ({(result.preview.normalized_quantity || 0) >= 0 ? '+' : ''}{result.preview.normalized_quantity})</span>
                    <span className={`text-[14px] font-mono font-semibold ${(result.preview.normalized_quantity || 0) >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {(result.preview.normalized_quantity || 0) >= 0 ? '+' : ''}{result.preview.normalized_quantity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">Projected Stock</span>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span className="text-[15px] font-mono font-bold text-[var(--text-primary)]">{result.preview.projected_stock}</span>
                    </div>
                  </div>
                </div>
                
                {result.preview.tune_note && (
                  <div className="mt-3 flex items-center justify-between px-1">
                    <span className="text-[11px] text-[var(--text-secondary)]">TUNE Conversion: <span className="font-mono">{result.preview.tune_note}</span></span>
                    {result.preview.validation === 'VALID' && (
                      <span className="flex items-center gap-1 text-[11px] text-[var(--success)] font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Validated</span>
                    )}
                  </div>
                )}
              </>
            ) : (
               <div className="bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">{result.preview.status.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)]">{result.preview.message}</p>

                  {result.preview.candidates && result.preview.candidates.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[11px] font-semibold text-[var(--text-primary)] mb-2">Select matching product:</p>
                      <div className="flex flex-wrap gap-2">
                        {result.preview.candidates.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => selectCandidate(c)}
                            className="px-3 py-1.5 bg-white border border-[var(--primary)] text-[var(--primary)] font-medium text-[12px] rounded-md hover:bg-[var(--primary)] hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <span>{c.name}</span>
                            <span className="text-[10px] opacity-75 font-mono">({c.sku})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
               </div>
            )}
          </div>
        </div>
      )}

      {/* ACTION BAR */}
      {!isCommitted && isReady && result.preview?.status === 'READY' && (
        <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--warning)] px-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[13px] font-medium">Ready to apply</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={reset}
              className="px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Discard
            </button>
            <button 
              onClick={confirmAndApply}
              className="px-5 py-2 text-[13px] font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-md shadow-sm transition-colors"
            >
              Confirm & Apply
            </button>
          </div>
        </div>
      )}

      {isCommitted && result.confirmed && (
        <div className="p-4 bg-[var(--success)]/5 border-t border-[var(--success)]/20 flex items-center justify-between py-5">
          <div className="flex items-center gap-2 text-[var(--success)] px-4">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[14px] font-semibold">Transaction applied to master ledger (ID: {result.confirmed.transaction_id})</span>
          </div>
          <button 
            onClick={reset}
            className="mr-2 px-5 py-2 text-[13px] font-medium bg-white border border-[var(--border)] text-[var(--text-primary)] rounded-md shadow-sm transition-colors"
          >
            New Command
          </button>
        </div>
      )}

    </div>
  );
}

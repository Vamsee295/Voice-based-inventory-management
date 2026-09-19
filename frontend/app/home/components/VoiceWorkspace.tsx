'use client';

import { useState } from 'react';
import { Mic, ArrowRight, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { DemoSession } from '../demoData';

interface VoiceWorkspaceProps {
  session: DemoSession;
  isListening: boolean;
  isConfirmed: boolean;
  selectedDisambiguation: string | null;
  setSelectedDisambiguation: (id: string) => void;
  onSimulateListen: () => void;
  onProcessText?: (text: string) => void;
  onConfirm: () => void;
  onDiscard: () => void;
}

export default function VoiceWorkspace({
  session,
  isListening,
  isConfirmed,
  selectedDisambiguation,
  setSelectedDisambiguation,
  onSimulateListen,
  onProcessText,
  onConfirm,
  onDiscard
}: VoiceWorkspaceProps) {
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRunCommand = () => {
    if (!textInput.trim() || !onProcessText) return;
    setIsProcessing(true);
    onProcessText(textInput);
    setTimeout(() => {
      setIsProcessing(false);
      setTextInput('');
    }, 500); // Simulate network delay or clear on process
  };
  
  // Status text for the top right
  let statusText = 'Voice Ready';
  let statusColor = 'text-[var(--primary)] bg-[var(--primary)]/10';
  
  if (isConfirmed) {
    statusText = 'Transaction Committed';
    statusColor = 'text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/20';
  } else if (isListening) {
    statusText = 'Mic Active';
    statusColor = 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/20';
  } else if (session.hasDisambiguation) {
    statusText = 'Needs Clarification';
    statusColor = 'text-[var(--danger)] bg-[var(--danger)]/10 border-[var(--danger)]/20';
  } else {
    statusText = 'Review Required';
    statusColor = 'text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/20';
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm flex flex-col overflow-hidden max-w-4xl mx-auto">
      
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
          onClick={onSimulateListen}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isListening 
              ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30 scale-110 animate-pulse' 
              : 'bg-[var(--surface-low)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--border)]'
          }`}
        >
          <Mic className="w-7 h-7" strokeWidth={isListening ? 2.5 : 2} />
        </button>
        
        <p className={`mt-4 text-[12px] font-semibold tracking-widest uppercase ${isListening ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>
          {isListening ? 'Listening...' : 'Tap to Speak'}
        </p>

        <div className="flex items-center gap-4 my-6 w-full max-w-md">
          <div className="h-px bg-[var(--divider)] flex-1"></div>
          <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest uppercase">OR</span>
          <div className="h-px bg-[var(--divider)] flex-1"></div>
        </div>

        <div className="w-full max-w-2xl relative flex shadow-sm rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--surface)] focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:border-[var(--primary)] transition-all">
          <input 
            type="text" 
            placeholder="Type a command... (e.g. Rice rendu bags vachayi)"
            className="flex-1 px-4 py-3 bg-transparent text-[14px] text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-muted)]"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRunCommand();
              }
            }}
            disabled={isProcessing || isListening}
          />
          <button 
            onClick={handleRunCommand}
            disabled={!textInput.trim() || isProcessing || isListening}
            className="px-6 font-semibold text-[13px] text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--text-muted)] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isProcessing ? 'Processing...' : 'Run Command'}
          </button>
        </div>

        {session.phrase && (
          <div className="mt-6 text-center max-w-2xl">
            <p className="text-[18px] font-medium text-[var(--text-primary)]">"{session.phrase}"</p>
          </div>
        )}
      </div>

      {/* ANALYSIS ZONE */}
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[var(--divider)] bg-[var(--surface-low)]/30">
        
        {/* Understood Section */}
        <div className="flex-1 p-6">
          <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest uppercase mb-4">Understood</p>
          
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            <div>
              <p className="text-[11px] text-[var(--text-secondary)] mb-1">Intent</p>
              <div className="flex items-center gap-1.5">
                {session.intent === 'STOCK_IN' ? (
                  <span className="text-[var(--success)] font-semibold text-[14px]">STOCK IN</span>
                ) : (
                  <span className="text-[var(--danger)] font-semibold text-[14px]">STOCK OUT</span>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-[11px] text-[var(--text-secondary)] mb-1">Product</p>
              <p className="font-semibold text-[14px] text-[var(--text-primary)] truncate" title={session.understoodProduct}>
                {session.understoodProduct}
              </p>
            </div>
            
            <div>
              <p className="text-[11px] text-[var(--text-secondary)] mb-1">Quantity</p>
              <p className="font-semibold text-[14px] text-[var(--text-primary)]">
                {session.understoodQuantity} <span className="text-[var(--text-secondary)] font-normal">{session.understoodUnit}</span>
              </p>
            </div>

            <div>
              <p className="text-[11px] text-[var(--text-secondary)] mb-1">Language</p>
              <p className="font-medium text-[13px] text-[var(--text-primary)]">{session.language}</p>
            </div>
          </div>
        </div>

        {/* Verify Section */}
        <div className="flex-1 p-6">
          <p className="text-[10px] font-bold text-[var(--text-muted)] tracking-widest uppercase mb-4">Verify Inventory Impact</p>
          
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-medium text-[var(--text-secondary)]">Current Stock</span>
              <span className="text-[14px] font-mono text-[var(--text-primary)]">{session.transactionPreview.current}</span>
            </div>
            
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--divider)]">
              <span className="text-[12px] font-medium text-[var(--text-secondary)]">Change ({session.transactionPreview.quantity})</span>
              <span className={`text-[14px] font-mono font-semibold ${session.intent === 'STOCK_IN' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {session.intent === 'STOCK_IN' ? '+' : '-'}{session.transactionPreview.quantity}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">Projected Stock</span>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-[15px] font-mono font-bold text-[var(--text-primary)]">{session.transactionPreview.after}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between px-1">
            <span className="text-[11px] text-[var(--text-secondary)]">TUNE Conversion: <span className="font-mono">1 Bag = 25 kg</span></span>
            <span className="flex items-center gap-1 text-[11px] text-[var(--success)] font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Validated</span>
          </div>
        </div>
      </div>

      {/* DISAMBIGUATION ZONE */}
      {session.hasDisambiguation && session.disambiguationOptions && (
        <div className="px-6 py-5 border-t border-[var(--divider)] bg-amber-50/50">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-[var(--warning)]" />
            <h3 className="text-[13px] font-bold text-[var(--text-primary)]">
              Multi-SKU match detected for "{session.understoodProduct}"
            </h3>
          </div>
          <p className="text-[12px] text-[var(--text-secondary)] mb-4">
            Please select the exact catalog SKU to proceed with the transaction.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {session.disambiguationOptions.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedDisambiguation === opt.id
                    ? 'bg-[var(--primary)]/5 border-[var(--primary)] ring-1 ring-[var(--primary)]'
                    : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--text-muted)] hover:shadow-sm'
                }`}
              >
                <input
                  type="radio"
                  name="sku-disambiguation"
                  checked={selectedDisambiguation === opt.id}
                  onChange={() => setSelectedDisambiguation(opt.id)}
                  className="mt-0.5 accent-[var(--primary)]"
                />
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[var(--text-primary)] truncate">
                    {opt.name}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-1">
                    {opt.sku} · Stock: {opt.currentStock}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ACTION BAR */}
      {!isConfirmed ? (
        <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--warning)] px-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[13px] font-medium">Ready to apply</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onDiscard}
              className="px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Discard
            </button>
            <button 
              className="px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface-low)] rounded-md transition-colors shadow-sm"
            >
              Edit values
            </button>
            <button 
              onClick={onConfirm}
              disabled={session.hasDisambiguation && !selectedDisambiguation}
              className="px-5 py-2 text-[13px] font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--text-muted)] disabled:cursor-not-allowed rounded-md shadow-sm transition-colors"
            >
              Confirm & Apply
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[var(--success)]/5 border-t border-[var(--success)]/20 flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-[var(--success)]">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[14px] font-semibold">Transaction applied to master ledger</span>
          </div>
        </div>
      )}

    </div>
  );
}

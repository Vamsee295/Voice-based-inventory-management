"use client";

import React, { useState, useEffect } from 'react';

export default function HeroSection() {
  const [demoState, setDemoState] = useState<'idle' | 'listening' | 'parsed' | 'confirmed'>('idle');

  useEffect(() => {
    if (demoState === 'listening') {
      const timer = setTimeout(() => setDemoState('parsed'), 2500);
      return () => clearTimeout(timer);
    }
    if (demoState === 'confirmed') {
      const timer = setTimeout(() => setDemoState('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [demoState]);

  return (
    <section className="w-full py-10 lg:py-16 bg-[var(--surface)]">
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Editorial Statement */}
          <div className="lg:col-span-6 flex flex-col pt-4">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)]"></span>
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">
                Direct Voice Ledger
              </span>
            </div>
            <h1 className="text-[44px] sm:text-[54px] lg:text-[58px] leading-[1.08] font-semibold tracking-tight text-[var(--text-primary)] mb-6">
              Your inventory, just a conversation away.
            </h1>
            <p className="text-base text-[var(--text-secondary)] max-w-lg mb-10 leading-relaxed">
              Run your inventory by simply talking. VoiceMate turns everyday speech into verified inventory actions — without the forms, spreadsheets, and manual entry.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
              <a href="/home" className="inline-block bg-[var(--primary)] text-white text-sm font-medium px-6 py-3 rounded hover:bg-[var(--primary-hover)] transition-colors text-center shadow-sm">
                Get Started
              </a>
              <button className="bg-[var(--surface-container)] text-[var(--text-primary)] text-sm font-medium px-6 py-3 rounded hover:bg-[#E2E3E0] transition-colors text-center shadow-sm border border-[var(--border)]">
                See How It Works
              </button>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-[13px]">
              <span className="material-symbols-outlined text-[16px] text-[var(--primary)]">translate</span>
              <span>Telugu, Hindi, Tamil, Kannada, and Indian English.</span>
            </div>
          </div>

          {/* Right Column: Authentic Tactile POS Console */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg shadow-sm border border-[var(--border)] p-6 flex flex-col">
              
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-4 mb-4 bg-[var(--surface-low)] px-4 py-2 rounded border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
                  <span className="text-xs text-[var(--text-primary)] font-medium">Terminal 01 · Kukatpally Store</span>
                </div>
                <span className="text-[11px] text-[var(--text-tertiary)] uppercase font-semibold">Inward Register #0842</span>
              </div>

              {/* Utterance Capture Slate */}
              <div className="bg-[var(--surface-low)] rounded p-4 mb-4 border border-[var(--border)] relative overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold block">Captured Speech</span>
                  {demoState === 'listening' && (
                    <div className="flex gap-1 items-center h-3">
                      <span className="w-1 h-3 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
                      <span className="w-1 h-3 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                    </div>
                  )}
                </div>
                <p className="text-lg text-[var(--text-primary)] italic min-h-[28px]">
                  {demoState === 'idle' ? '...' : '“Rice rendu bags vachayi.”'}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[var(--text-tertiary)] text-[13px]">
                  <span className="material-symbols-outlined text-[14px]">mic</span>
                  <span>Spoken at 11:42 AM · Telugu / English</span>
                </div>
              </div>

              {/* Resolution Pipeline */}
              <div className={`space-y-2 mb-6 transition-opacity duration-500 ${demoState === 'parsed' || demoState === 'confirmed' ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div className="flex items-baseline justify-between py-1 px-1">
                  <span className="text-[13px] text-[var(--text-secondary)]">Identified Commodity</span>
                  <span className="text-sm text-[var(--text-primary)] font-medium">Rice (Sona Masoori)</span>
                </div>
                <div className="flex items-baseline justify-between py-1 px-2 bg-[var(--surface-low)] rounded border border-[var(--border)]">
                  <span className="text-[13px] text-[var(--text-secondary)]">Trade Unit Multiplier</span>
                  <span className="text-[13px] text-[var(--text-primary)]">2 Bags · (1 bag = 25 kg)</span>
                </div>
                <div className="flex items-baseline justify-between py-1 px-1">
                  <span className="text-[13px] text-[var(--text-secondary)]">Normalized Stock Impact</span>
                  <span className="text-sm text-[var(--success)] font-medium">+50.00 kg</span>
                </div>
                <div className="flex items-baseline justify-between py-1 px-1">
                  <span className="text-[13px] text-[var(--text-secondary)]">Ledger Target</span>
                  <span className="text-[13px] text-[var(--text-primary)]">Current: 120 kg → 170 kg</span>
                </div>
              </div>

              {/* Action Area */}
              <div className="pt-4 flex flex-col gap-2 bg-[var(--surface-low)] p-4 rounded border border-[var(--border)]">
                <div className="flex items-center justify-between text-[var(--text-secondary)] text-[11px] font-semibold">
                  <span>VERIFICATION STAGE</span>
                  {demoState === 'confirmed' ? (
                    <span className="text-[var(--success)] font-medium bg-[#eaf5ee] px-2 py-0.5 rounded">Ledger Updated</span>
                  ) : demoState === 'parsed' ? (
                    <span className="text-[var(--warning)] font-medium bg-[#fef8ee] px-2 py-0.5 rounded">Ready for confirmation</span>
                  ) : (
                    <span className="text-[var(--text-tertiary)] font-medium bg-[var(--surface-container)] px-2 py-0.5 rounded">Awaiting Input</span>
                  )}
                </div>
                
                {demoState === 'idle' ? (
                  <button onClick={() => setDemoState('listening')} className="w-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] text-sm font-medium py-2 px-4 rounded flex items-center justify-center gap-2 hover:bg-[var(--surface-container)] transition-colors">
                    <span className="material-symbols-outlined text-[16px]">mic</span>
                    <span>Start Voice Demo</span>
                  </button>
                ) : demoState === 'listening' ? (
                  <button disabled className="w-full bg-[var(--surface-container)] text-[var(--text-tertiary)] border border-[var(--border)] text-sm font-medium py-2 px-4 rounded flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[16px] animate-pulse">pending</span>
                    <span>Processing...</span>
                  </button>
                ) : demoState === 'confirmed' ? (
                  <button disabled className="w-full bg-[#eaf5ee] text-[var(--success)] border border-[var(--success)] text-sm font-medium py-2 px-4 rounded flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Transaction Recorded</span>
                  </button>
                ) : (
                  <button onClick={() => setDemoState('confirmed')} className="w-full bg-[var(--primary)] text-white text-sm font-medium py-2 px-4 rounded flex items-center justify-center gap-2 hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
                    <span>Confirm Ledger Entry</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

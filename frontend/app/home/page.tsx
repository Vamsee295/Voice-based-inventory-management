'use client';

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AppHeader from './components/AppHeader';
import VoiceCapturePanel from './components/VoiceCapturePanel';
import UnifiedUnderstandPanel from './components/UnifiedUnderstandPanel';
import UnifiedVerifyPanel from './components/UnifiedVerifyPanel';
import UnifiedConfirmGate from './components/UnifiedConfirmGate';
import ShopFloorTest from './components/ShopFloorTest';
import ShiftJournalStream from './components/ShiftJournalStream';
import NeedsAttention from './components/NeedsAttention';
import IndianTradeUnitReference from './components/IndianTradeUnitReference';
import { DEMO_SESSIONS, DemoSession } from './demoData';
import { useVoicePipeline } from './useVoicePipeline';

export default function HomePage() {
  const { isListening, activeSession, setActiveSession, processTranscript, startListening, stopListening } = useVoicePipeline();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [selectedDisambiguation, setSelectedDisambiguation] = useState<string | null>(null);

  useEffect(() => {
    if (!activeSession) {
       // Initialize with a default phrase so the pipeline runs
       processTranscript('Rice rendu bags vachayi');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSession = (session: DemoSession) => {
    processTranscript(session.phrase);
    setIsConfirmed(false);
    setSelectedDisambiguation(null);
  };

  const handleSimulateListen = () => {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
  };

  const handleConfirmAction = async () => {
    if (!activeSession) return;
    setIsConfirmed(true);
    try {
      const { inventoryService } = await import('../../lib/inventory/services/inventoryService');
      const products = await inventoryService.getAllProducts();

      for (const ent of activeSession.entities) {
        const matched =
          products.find((p) => p.sku === ent.sku) ||
          products.find((p) =>
            p.name.toLowerCase().includes(activeSession.understoodProduct.toLowerCase())
          ) ||
          products[0];

        if (matched) {
          if (activeSession.intent === 'STOCK_IN') {
            await inventoryService.stockIn({
              productId: matched.id,
              quantity: ent.quantity,
              unit: ent.unit,
              source: 'VOICE',
              note: `Voice command: "${activeSession.phrase}"`,
              createdBy: 'Suresh R.',
            });
          } else if (activeSession.intent === 'STOCK_OUT') {
            await inventoryService.stockOut({
              productId: matched.id,
              quantity: ent.quantity,
              unit: ent.unit,
              source: 'VOICE',
              note: `Voice command: "${activeSession.phrase}"`,
              createdBy: 'Suresh R.',
            });
          }
        }
      }
    } catch (e) {
      console.error('Failed to commit voice transaction to inventory service:', e);
    }
  };

  const handleDiscard = () => {
    setIsConfirmed(false);
    setSelectedDisambiguation(null);
  };

  const headerStatus = isConfirmed
    ? 'COMPLETED'
    : (activeSession && activeSession.hasDisambiguation)
    ? 'DISAMBIGUATING'
    : 'REVIEW';

  if (!activeSession) {
    return <div className="flex h-screen bg-[#F7F7F4] items-center justify-center font-sans">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-[#F7F7F4] font-sans text-[#111318] overflow-hidden">
      {/* Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <AppHeader customStatus={headerStatus} />

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col xl:flex-row gap-0 min-h-full">

            {/* ── Central Operational Console (Primary Pipeline) ── */}
            <main className="flex-1 min-w-0 p-4 lg:p-5 overflow-y-auto">

              {/* 01 CAPTURE — Acoustic Input */}
              <VoiceCapturePanel
                language={activeSession.language}
                confidence={activeSession.confidence}
                isListening={isListening}
                onSimulateListen={handleSimulateListen}
              />

              {/* 02 UNDERSTAND — Natural Language Interpretation */}
              <UnifiedUnderstandPanel
                phrase={activeSession.phrase}
                language={activeSession.language}
                confidence={activeSession.confidence}
                category={activeSession.tag}
                intent={activeSession.intent}
                intentLabel={activeSession.intentLabel}
                product={activeSession.understoodProduct}
                quantity={activeSession.understoodQuantity}
                unit={activeSession.understoodUnit}
                resolvedSkuName={activeSession.resolvedSkuName}
              />

              {/* Disambiguation Resolver (Visible when active session has ambiguity) */}
              {activeSession.hasDisambiguation && activeSession.disambiguationOptions && (
                <div className="bg-[#FFFFFF] border border-[#B45309]/40 rounded-md overflow-hidden mb-3">
                  <div className="px-4 py-2 border-b border-[#B45309]/20 bg-[#FEF8ED] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-[#B45309]">
                        help_outline
                      </span>
                      <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#B45309]">
                        SKU Disambiguation Required
                      </h3>
                    </div>
                    <span className="text-[9px] font-mono text-[#B45309] bg-[#FFFFFF] border border-[#B45309]/30 px-1.5 py-0.5 rounded">
                      Operator Decision Gate
                    </span>
                  </div>
                  <div className="p-3.5">
                    <p className="text-[12px] text-[#5F6673] mb-2.5">
                      Multi-SKU match detected for{' '}
                      <strong className="text-[#111318]">&quot;Freedom Oil&quot;</strong>. Select
                      the exact catalog SKU:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeSession.disambiguationOptions.map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition-all ${
                            selectedDisambiguation === opt.id
                              ? 'bg-[#EEF2FF] border-[#2457FF] ring-1 ring-[#2457FF]'
                              : 'bg-[#F9F9F7] border-[#E5E5E0] hover:bg-[#F4F4F1]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="sku-disambiguation"
                            checked={selectedDisambiguation === opt.id}
                            onChange={() => setSelectedDisambiguation(opt.id)}
                            className="mt-0.5 accent-[#2457FF]"
                          />
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold text-[#111318] truncate">
                              {opt.name}
                            </p>
                            <p className="text-[10px] text-[#8E95A2] font-mono mt-0.5">
                              {opt.sku} · Stock: {opt.currentStock} · {opt.location}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 03 VERIFY — Inventory Impact Preview */}
              <UnifiedVerifyPanel
                entities={activeSession.entities}
                operation={activeSession.transactionPreview.operation}
                product={activeSession.transactionPreview.product}
                quantity={activeSession.transactionPreview.quantity}
                current={activeSession.transactionPreview.current}
                after={activeSession.transactionPreview.after}
                source={activeSession.transactionPreview.source}
                status={activeSession.transactionPreview.status}
              />

              {/* 04 CONFIRM — Operator Decision Gate */}
              <UnifiedConfirmGate
                isConfirmed={isConfirmed}
                onConfirm={handleConfirmAction}
                onDiscard={handleDiscard}
              />

              {/* Shop-Floor Test Toolbar (Secondary, docked at bottom) */}
              <ShopFloorTest
                currentSessionId={activeSession.id}
                onSelectSession={handleSelectSession}
              />
            </main>

            {/* ── Right Operational Rail ── */}
            <aside className="w-full xl:w-[300px] shrink-0 border-t xl:border-t-0 xl:border-l border-[#E5E5E0] bg-[#F7F7F4] p-3 overflow-y-auto">
              {/* Shift Journal Activity Stream */}
              <ShiftJournalStream />

              {/* Operational Needs Attention */}
              <NeedsAttention />

              {/* Indian Trade Units Reference (TUNE) */}
              <IndianTradeUnitReference />
            </aside>

          </div>
        </div>
      </div>
    </div>
  );
}

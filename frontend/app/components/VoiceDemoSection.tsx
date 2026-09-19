"use client";

import React, { useState } from 'react';

type DemoTab = 'stock-in' | 'stock-out' | 'query' | 'reorder';

export default function VoiceDemoSection() {
  const [activeTab, setActiveTab] = useState<DemoTab>('stock-in');

  const content = {
    'stock-in': {
      label: "Stock In",
      command: "“We received 50 kg rice.”",
      result: (
        <div className="bg-[#eaf5ee] p-4 rounded border border-[#c1e6cf]">
          <span className="text-[11px] font-bold text-[var(--success)] uppercase tracking-wider block mb-2">STOCK IN</span>
          <span className="text-sm font-semibold text-[var(--text-primary)] block">Rice</span>
          <span className="text-xl font-bold text-[var(--success)]">+50 kg</span>
        </div>
      )
    },
    'stock-out': {
      label: "Stock Out",
      command: "“Sell 5 packets of sugar.”",
      result: (
        <div className="bg-[#f5f7ff] p-4 rounded border border-[#dce4ff]">
          <span className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider block mb-2">STOCK OUT</span>
          <span className="text-sm font-semibold text-[var(--text-primary)] block">Sugar (1kg Packet)</span>
          <span className="text-xl font-bold text-[var(--primary)]">-5 packets</span>
        </div>
      )
    },
    'query': {
      label: "Check Stock",
      command: "“How much cooking oil do we have?”",
      result: (
        <div className="bg-white p-4 rounded border border-[var(--border)]">
          <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-2">INVENTORY QUERY</span>
          <span className="text-sm font-semibold text-[var(--text-primary)] block">Cooking Oil (1L)</span>
          <span className="text-xl font-bold text-[var(--text-primary)]">32 bottles available</span>
        </div>
      )
    },
    'reorder': {
      label: "Reorder",
      command: "“What should I reorder tomorrow?”",
      result: (
        <div className="bg-[#fef8ee] p-4 rounded border border-[#fde6c5]">
          <span className="text-[11px] font-bold text-[var(--warning)] uppercase tracking-wider block mb-2">REORDER ALERT</span>
          <span className="text-sm font-semibold text-[var(--text-primary)] block mb-1">3 products need replenishment.</span>
          <ul className="text-sm text-[var(--text-secondary)] space-y-1">
            <li>• Sona Masoori Rice (18kg left)</li>
            <li>• Fortune Oil 15L (2 tins left)</li>
            <li>• Tata Salt (4 pkts left)</li>
          </ul>
        </div>
      )
    }
  };

  return (
    <section className="w-full py-20 bg-[var(--surface-low)] border-b border-[var(--border)]">
      <div className="max-w-[800px] mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-[28px] font-semibold text-[var(--text-primary)] tracking-tight mb-4">
            Say it naturally. VoiceMate handles the rest.
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            Speak in your normal voice. VoiceMate translates intent into structured operational data.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="flex border-b border-[var(--border)] overflow-x-auto">
            {(Object.keys(content) as DemoTab[]).map(key => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 min-w-[120px] py-4 text-sm font-semibold transition-colors ${
                  activeTab === key
                    ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-[var(--surface-low)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-low)] hover:text-[var(--text-primary)] border-b-2 border-transparent'
                }`}
              >
                {content[key].label}
              </button>
            ))}
          </div>
          
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block mb-2">You Say</span>
                <p className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] italic">
                  {content[activeTab].command}
                </p>
              </div>
              <div className="flex justify-center md:justify-end">
                <span className="material-symbols-outlined text-[32px] text-[var(--border-highest)] hidden md:block mr-8">arrow_forward</span>
                <div className="w-full md:w-64 text-left">
                  <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block mb-2">VoiceMate Prepares</span>
                  {content[activeTab].result}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

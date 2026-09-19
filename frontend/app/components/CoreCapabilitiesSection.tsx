import React from 'react';

const capabilities = [
  {
    icon: 'mic',
    title: 'Voice Inventory',
    description: 'Manage stock through natural language without touching a keyboard or navigating menus.'
  },
  {
    icon: 'translate',
    title: 'Multilingual Input',
    description: 'Support real-world multilingual and code-switched commands natively (Telugu, Hindi, English).'
  },
  {
    icon: 'scale',
    title: 'Smart Units',
    description: 'Understand kg, gram, litre, packet, bag, bottle, box, carton, piece, and dozen automatically.'
  },
  {
    icon: 'receipt_long',
    title: 'Invoice Intake',
    description: 'Turn supplier paper invoices and delivery challans into reviewable inventory entries.'
  },
  {
    icon: 'barcode_scanner',
    title: 'Barcode Scanning',
    description: 'Use fast camera scanning when speaking isn’t practical for high-density barcoded items.'
  },
  {
    icon: 'trending_up',
    title: 'Reorder Intelligence',
    description: 'Identify products that need replenishment based on daily run-rates and lead times.'
  },
  {
    icon: 'event_busy',
    title: 'Expiry Tracking',
    description: 'Surface perishable products approaching expiry dates well before they need to be discarded.'
  },
  {
    icon: 'history',
    title: 'Activity Ledger',
    description: 'Maintain a permanent, traceable history of all inventory changes and approvals.'
  }
];

export default function CoreCapabilitiesSection() {
  return (
    <section className="w-full py-20 bg-[var(--surface)] border-b border-[var(--border)]">
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8">
        <div className="mb-12">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold block mb-2">Core Capabilities</span>
          <h2 className="text-[28px] font-semibold text-[var(--text-primary)] tracking-tight">
            Built for physical trade operations.
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-[var(--border)] shadow-sm hover:border-[var(--primary)] hover:shadow-md transition-all">
              <span className="material-symbols-outlined text-[28px] text-[var(--primary)] mb-4 block">
                {cap.icon}
              </span>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mb-2">
                {cap.title}
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                {cap.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

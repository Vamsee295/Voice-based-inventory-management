import React from 'react';

const scenarios = [
  {
    title: "Delivery Arrives",
    context: "“We received 50 kg rice.”",
    description: "VoiceMate prepares the stock-in transaction."
  },
  {
    title: "Customer Sale",
    context: "“Sell 5 packets sugar.”",
    description: "VoiceMate prepares the stock-out deduction."
  },
  {
    title: "Busy Shop Floor",
    context: "“How much cooking oil is left?”",
    description: "VoiceMate immediately retrieves current stock."
  },
  {
    title: "Supplier Invoice",
    context: "Upload invoice photo.",
    description: "VoiceMate extracts items and quantities for review."
  },
  {
    title: "Reorder Planning",
    context: "“What should I order tomorrow?”",
    description: "VoiceMate identifies products requiring replenishment."
  },
  {
    title: "Expiry Management",
    context: "“What expires this week?”",
    description: "VoiceMate surfaces products requiring immediate attention."
  }
];

export default function RealWorldUseCasesSection() {
  return (
    <section className="w-full py-20 bg-[var(--surface)] border-b border-[var(--border)]">
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8">
        <div className="mb-12">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold block mb-2">Operational Reality</span>
          <h2 className="text-[28px] font-semibold text-[var(--text-primary)] tracking-tight">
            Built for the moments inventory actually happens.
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-[var(--border)] shadow-sm hover:border-[var(--text-tertiary)] transition-colors">
              <span className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider block mb-3">
                {scenario.title}
              </span>
              <p className="text-[17px] font-medium text-[var(--text-primary)] italic mb-4">
                {scenario.context}
              </p>
              <div className="bg-[var(--surface-low)] p-3 rounded border border-[var(--border)]">
                <p className="text-[13px] text-[var(--text-secondary)] font-medium">
                  {scenario.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

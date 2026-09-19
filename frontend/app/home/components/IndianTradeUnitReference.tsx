'use client';

const TRADE_UNITS = [
  { unit: 'Bag', vernacular: 'బస్తా (Basta)', value: '25 kg', note: 'Andhra standard' },
  { unit: 'Katta', vernacular: 'కట్టా (Katta)', value: '50 kg', note: 'Telangana standard' },
  { unit: 'Tin / Dabba', vernacular: 'డబ్బా (Dabba)', value: '15 L', note: 'Edible oil standard' },
  { unit: 'Quintal', vernacular: 'క్వింటాల్', value: '100 kg', note: 'Bulk produce' },
  { unit: 'Dozen', vernacular: 'డజన్', value: '12 pcs', note: 'FMCG standard' },
  { unit: 'Packet', vernacular: 'ప్యాకెట్', value: 'Business config.', note: 'Configurable' },
  { unit: 'Bottle', vernacular: 'బాటిల్', value: 'Business config.', note: 'Configurable' },
  { unit: 'Box', vernacular: 'పెట్టె (Pette)', value: 'Business config.', note: 'Configurable' },
];

export default function IndianTradeUnitReference() {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm overflow-hidden mb-4">
      <div className="px-3 py-2.5 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-[#5F6673]">scale</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#111318]">Indian Trade Units Reference (TUNE)</span>
        </div>
        <button className="text-[9px] font-bold text-[#2457FF] uppercase tracking-wider hover:underline">
          Configure →
        </button>
      </div>

      <div className="p-3 grid grid-cols-2 gap-1.5">
        {TRADE_UNITS.map((tu) => (
          <div key={tu.unit} className="bg-[#F4F4F1] border border-[#E5E5E0] rounded px-2 py-1.5">
            <div className="flex items-baseline justify-between gap-1 mb-0.5">
              <span className="text-[11px] font-semibold text-[#111318]">{tu.unit}</span>
              <span className="text-[11px] font-bold font-mono text-[#2457FF]">{tu.value}</span>
            </div>
            <p className="text-[9px] text-[#8E95A2] truncate">{tu.vernacular}</p>
          </div>
        ))}
      </div>

      <div className="px-3 py-2 border-t border-[#ECECE8] bg-[#F9F9F7]">
        <p className="text-[9px] text-[#8E95A2]">
          ⓘ Conversions are configurable per business and SKU category. ISO / GS1 compliance mode available.
        </p>
      </div>
    </div>
  );
}

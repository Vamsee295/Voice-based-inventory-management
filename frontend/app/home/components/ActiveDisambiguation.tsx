'use client';

import { useState } from 'react';
import { useInventoryStore } from '../useInventoryStore';

export default function ActiveDisambiguation() {
  const { voice, resolveDisambiguation } = useInventoryStore();
  const [selected, setSelected] = useState<string | null>(null);

  if (voice.status !== 'DISAMBIGUATING' || !voice.disambiguation) return null;

  const { disambiguation } = voice;

  const handleConfirm = () => {
    const product = disambiguation.options.find((p) => p.id === selected);
    if (product) {
      resolveDisambiguation(disambiguation.entityId, product);
      setSelected(null);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#B45309]/40 rounded-lg shadow-sm overflow-hidden mb-4">
      <div className="px-3 py-2.5 border-b border-[#B45309]/20 bg-[#FEF8ED] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-[#B45309]">help_outline</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#B45309]">Active Disambiguation</span>
        </div>
        <span className="text-[9px] font-semibold text-[#B45309] bg-[#FFFFFF] border border-[#B45309]/30 px-1.5 py-0.5 rounded">Self-resolving</span>
      </div>

      <div className="p-3">
        <p className="text-[11px] text-[#5F6673] mb-1">Previous Operation Prompt:</p>
        <p className="text-[13px] font-semibold text-[#111318] italic mb-2">"{disambiguation.rawPhrase}"</p>
        <p className="text-[11px] text-[#5F6673] mb-3">Ambiguity Detected (Multi-SKU Conflict) — Which product did you mean?</p>

        <div className="space-y-2 mb-3">
          {disambiguation.options.map((product) => (
            <label
              key={product.id}
              className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer transition-colors ${
                selected === product.id
                  ? 'bg-[#EEF2FF] border-[#2457FF]'
                  : 'bg-[#F4F4F1] border-[#E5E5E0] hover:bg-[#EEEEEB]'
              }`}
            >
              <input
                type="radio"
                name="disambiguation"
                value={product.id}
                checked={selected === product.id}
                onChange={() => setSelected(product.id)}
                className="accent-[#2457FF]"
              />
              <div>
                <p className="text-[12px] font-semibold text-[#111318]">{product.name}</p>
                <p className="text-[10px] text-[#8E95A2]">{product.sku} · {product.packagingType}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="flex-1 px-3 py-2 bg-[#2457FF] text-white text-[12px] font-semibold rounded hover:bg-[#003ED7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Selection
          </button>
          <button
            onClick={() => setSelected(null)}
            className="px-3 py-2 bg-[#F4F4F1] text-[#111318] text-[12px] font-semibold border border-[#E5E5E0] rounded hover:bg-[#EEEEEB] transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-[9px] text-[#8E95A2]">Operator Confirmed: Freedom Sunflower Oil (15L)</p>
          <p className="text-[9px] text-[#16794A]">Resolved in 1.4s</p>
        </div>
      </div>
    </div>
  );
}

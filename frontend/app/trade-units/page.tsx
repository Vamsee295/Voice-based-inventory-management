'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../home/components/Sidebar';
import AppHeader from '../home/components/AppHeader';
import { tradeUnitsApi, TradeUnit } from '../../src/services/api/tradeUnitsApi';
import { productsApi } from '../../src/services/api/productsApi';
import { Product } from '../../lib/inventory/models/product';
import { Settings2, Plus, Edit2, Trash2 } from 'lucide-react';

export default function TradeUnitsPage() {
  const [tradeUnits, setTradeUnits] = useState<TradeUnit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [unitName, setUnitName] = useState('');
  const [conversionFactor, setConversionFactor] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [unitsRes, prodsRes] = await Promise.all([
        tradeUnitsApi.getAll(),
        productsApi.getAll()
      ]);
      setTradeUnits(unitsRes);
      if (prodsRes) {
        setProducts(prodsRes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (unit?: TradeUnit) => {
    if (unit) {
      setEditingId(unit.id);
      setSelectedProductId(unit.product_id);
      setUnitName(unit.name);
      setConversionFactor(unit.conversion_factor.toString());
    } else {
      setEditingId(null);
      setSelectedProductId(products[0]?.id || '');
      setUnitName('');
      setConversionFactor('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedProductId || !unitName || !conversionFactor) return;
    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (!selectedProduct) return;

    try {
      if (editingId) {
        await tradeUnitsApi.update(editingId, {
          name: unitName,
          conversion_factor: parseFloat(conversionFactor)
        });
      } else {
        await tradeUnitsApi.create({
          product_id: selectedProductId,
          name: unitName,
          base_unit: selectedProduct.baseUnit,
          conversion_factor: parseFloat(conversionFactor),
          is_active: true
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this trade unit?")) {
      await tradeUnitsApi.delete(id);
      loadData();
    }
  };

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AppHeader 
          title="Trade Units" 
          subtitle="Define how your business measures and sells inventory."
          icon={<Settings2 className="w-5 h-5 text-[var(--primary)]" />}
        />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Configured Trade Units</h2>
              <button 
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-md font-medium text-[13px] hover:bg-[var(--primary-hover)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Trade Unit
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-[var(--text-muted)] text-[13px]">Loading configuration...</div>
            ) : (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[var(--surface-low)] border-b border-[var(--border)] text-[var(--text-secondary)]">
                    <tr>
                      <th className="px-5 py-3 font-medium">Product</th>
                      <th className="px-5 py-3 font-medium">Trade Unit</th>
                      <th className="px-5 py-3 font-medium">Conversion</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {tradeUnits.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-[var(--text-muted)]">
                          No trade units configured.
                        </td>
                      </tr>
                    ) : (
                      tradeUnits.map((tu) => {
                        const product = products.find(p => p.id === tu.product_id);
                        return (
                          <tr key={tu.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                            <td className="px-5 py-3 text-[var(--text-primary)] font-medium">
                              {product?.name || 'Unknown Product'}
                            </td>
                            <td className="px-5 py-3 text-[var(--text-primary)]">{tu.name}</td>
                            <td className="px-5 py-3 text-[var(--text-secondary)]">
                              1 {tu.name} = <span className="font-medium text-[var(--text-primary)]">{tu.conversion_factor} {tu.base_unit}</span>
                            </td>
                            <td className="px-5 py-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--success-bg)] text-[var(--success)]">
                                Active
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button onClick={() => openModal(tu)} className="text-[var(--text-muted)] hover:text-[var(--primary)] p-1 transition-colors mr-2">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(tu.id)} className="text-[var(--text-muted)] hover:text-[var(--danger)] p-1 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--surface)] w-full max-w-md rounded-xl border border-[var(--border)] shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[var(--border)]">
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">
                {editingId ? 'Edit Trade Unit' : 'Add Trade Unit'}
              </h2>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">Product</label>
                <select 
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  disabled={!!editingId}
                  className="w-full bg-[var(--surface-low)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">Trade Unit Name</label>
                <input 
                  type="text" 
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  placeholder="e.g. Bag, Box, Carton"
                  className="w-full bg-[var(--surface-low)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">Conversion</label>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[var(--text-secondary)]">1 {unitName || 'Unit'} =</span>
                  <input 
                    type="number" 
                    value={conversionFactor}
                    onChange={(e) => setConversionFactor(e.target.value)}
                    placeholder="25"
                    className="flex-1 bg-[var(--surface-low)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <span className="text-[13px] text-[var(--text-secondary)]">
                    {products.find(p => p.id === selectedProductId)?.baseUnit || 'Base'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[var(--surface-low)] border-t border-[var(--border)] flex justify-end gap-2">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!unitName || !conversionFactor}
                className="px-4 py-2 text-[13px] font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-md transition-colors disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

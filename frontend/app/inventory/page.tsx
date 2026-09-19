'use client';

import { useState } from 'react';
import Sidebar from '../home/components/Sidebar';
import AppHeader from '../home/components/AppHeader';
import StatusBadge from '../home/components/StatusBadge';
import { useInventory } from '../../lib/inventory/hooks/useInventory';
import { Product } from '../../lib/inventory/models/product';
import { SUPPORTED_UNITS } from '../../lib/inventory/models/units';
import ProductDetailDrawer from './components/ProductDetailDrawer';

export default function InventoryPage() {
  const {
    products,
    filteredProducts,
    categories,
    loading,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    metrics,
    createProduct,
    updateProduct,
    stockIn,
    stockOut,
    adjustStock,
  } = useInventory();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [actionType, setActionType] = useState<'STOCK_IN' | 'STOCK_OUT' | 'ADJUST' | 'EDIT' | null>(null);

  // Drawer state
  const [drawerProductId, setDrawerProductId] = useState<string | null>(null);
  const drawerProduct = products.find((p) => p.id === drawerProductId) || null;
  const openDrawer = (p: Product) => setDrawerProductId(p.id);
  const closeDrawer = () => setDrawerProductId(null);

  const openFromDrawer = (p: Product, type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUST' | 'EDIT') => {
    closeDrawer();
    openActionModal(p, type);
  };

  // Form states for modals
  const [quantityInput, setQuantityInput] = useState('1');
  const [unitInput, setUnitInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Add product form state
  const [addForm, setAddForm] = useState({
    name: '',
    sku: '',
    category: 'Grains & Pulses',
    openingStock: '0',
    baseUnit: 'kg',
    price: '0',
    reorderLevel: '10',
    expiryDate: '',
    customUnitName: 'Bag',
    customUnitValue: '25',
  });
  const [addError, setAddError] = useState<string | null>(null);

  // Edit product form state
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: '0',
    reorderLevel: '10',
    expiryDate: '',
  });

  const openActionModal = (prod: Product, type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUST' | 'EDIT') => {
    setSelectedProduct(prod);
    setActionType(type);
    setQuantityInput('1');
    setUnitInput(prod.baseUnit);
    setNoteInput('');
    setActionError(null);
    setActionSuccess(null);

    if (type === 'EDIT') {
      setEditForm({
        name: prod.name,
        category: prod.category,
        price: prod.price.toString(),
        reorderLevel: prod.reorderLevel.toString(),
        expiryDate: prod.expiryDate || '',
      });
    }
  };

  const closeActionModal = () => {
    setActionType(null);
    setSelectedProduct(null);
    setActionError(null);
  };

  // Handle Add Product Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const openingStockNum = parseFloat(addForm.openingStock) || 0;
    const priceNum = parseFloat(addForm.price) || 0;
    const reorderLevelNum = parseFloat(addForm.reorderLevel) || 0;

    const unitConversions: Record<string, number> = {};
    if (addForm.customUnitName && parseFloat(addForm.customUnitValue) > 0) {
      unitConversions[addForm.customUnitName.trim()] = parseFloat(addForm.customUnitValue);
    }

    const res = await createProduct({
      name: addForm.name,
      sku: addForm.sku,
      category: addForm.category,
      openingStock: openingStockNum,
      baseUnit: addForm.baseUnit,
      price: priceNum,
      reorderLevel: reorderLevelNum,
      expiryDate: addForm.expiryDate || null,
      unitConversions,
    });

    if (!res.success) {
      setAddError(res.error || 'Failed to create product.');
    } else {
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        sku: '',
        category: 'Grains & Pulses',
        openingStock: '0',
        baseUnit: 'kg',
        price: '0',
        reorderLevel: '10',
        expiryDate: '',
        customUnitName: 'Bag',
        customUnitValue: '25',
      });
      setActionSuccess(`Product "${res.data?.name}" created successfully!`);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Handle Edit Product Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setActionError(null);

    const priceNum = parseFloat(editForm.price) || 0;
    const reorderLevelNum = parseFloat(editForm.reorderLevel) || 0;

    const res = await updateProduct(selectedProduct.id, {
      name: editForm.name,
      category: editForm.category,
      price: priceNum,
      reorderLevel: reorderLevelNum,
      expiryDate: editForm.expiryDate || null,
    });

    if (!res.success) {
      setActionError(res.error || 'Failed to update product.');
    } else {
      closeActionModal();
      setActionSuccess(`Product "${res.data?.name}" updated successfully!`);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Handle Stock In Submit
  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setActionError(null);

    const qty = parseFloat(quantityInput);
    if (isNaN(qty) || qty <= 0) {
      setActionError('Quantity must be greater than zero.');
      return;
    }

    const res = await stockIn({
      productId: selectedProduct.id,
      quantity: qty,
      unit: unitInput,
      source: 'MANUAL',
      note: noteInput || 'Manual stock inward',
    });

    if (!res.success) {
      setActionError(res.error || 'Failed to stock in.');
    } else {
      closeActionModal();
      setActionSuccess(`Stock added! New balance: ${res.data?.product.currentStock} ${selectedProduct.baseUnit}`);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Handle Stock Out Submit
  const handleStockOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setActionError(null);

    const qty = parseFloat(quantityInput);
    if (isNaN(qty) || qty <= 0) {
      setActionError('Quantity must be greater than zero.');
      return;
    }

    const res = await stockOut({
      productId: selectedProduct.id,
      quantity: qty,
      unit: unitInput,
      source: 'MANUAL',
      note: noteInput || 'Manual stock dispatch',
    });

    if (!res.success) {
      setActionError(res.error || 'Failed to stock out.');
    } else {
      closeActionModal();
      setActionSuccess(`Stock removed! New balance: ${res.data?.product.currentStock} ${selectedProduct.baseUnit}`);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Handle Stock Adjust Submit
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setActionError(null);

    const physical = parseFloat(quantityInput);
    if (isNaN(physical) || physical < 0) {
      setActionError('Physical stock count cannot be negative.');
      return;
    }

    const res = await adjustStock({
      productId: selectedProduct.id,
      newPhysicalStock: physical,
      note: noteInput || 'Physical audit count adjustment',
    });

    if (!res.success) {
      setActionError(res.error || 'Failed to adjust stock.');
    } else {
      closeActionModal();
      setActionSuccess(`Stock adjusted to ${res.data?.product.currentStock} ${selectedProduct.baseUnit}!`);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F7F4] font-sans text-[#111318] overflow-hidden">
      {/* Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <AppHeader />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-4">

            {/* Success Notification Banner */}
            {actionSuccess && (
              <div className="bg-[#E8F4EC] border border-[#C6E5D6] rounded-lg p-3 flex items-center justify-between shadow-sm transition-all">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#16794A]">check_circle</span>
                  <p className="text-[13px] font-bold text-[#16794A]">{actionSuccess}</p>
                </div>
                <button
                  onClick={() => setActionSuccess(null)}
                  className="text-[12px] font-bold text-[#16794A] hover:underline"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Page Title, Inline Summary Bar & Action */}
            <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-md overflow-hidden">
              {/* Title row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 border-b border-[#ECECE8]">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-[15px] font-bold text-[#111318] tracking-tight">
                    Inventory Master Catalog
                  </h1>
                  <span className="text-[9px] font-bold font-mono tracking-widest uppercase bg-[#EEF2FF] text-[#2457FF] border border-[#2457FF]/30 px-1.5 py-0.5 rounded">
                    TUNE Enabled
                  </span>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#2457FF] hover:bg-[#003ED7] active:bg-[#0030A3] text-white text-[11px] font-bold rounded shadow-sm transition-all shrink-0"
                >
                  <span className="material-symbols-outlined text-[15px]">add_box</span>
                  ADD PRODUCT
                </button>
              </div>

              {/* Inline compact summary bar */}
              <div className="px-4 py-2.5 flex items-center gap-4 text-[12px]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-[#5F6673]">inventory_2</span>
                  <span className="font-bold text-[#111318]">{metrics.totalSkus}</span>
                  <span className="text-[#5F6673]">SKUs</span>
                </div>
                <span className="text-[#D6D6D0]">/</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-[#C2410C]">warning</span>
                  <span className={`font-bold ${metrics.lowStockCount > 0 ? 'text-[#C2410C]' : 'text-[#5F6673]'}`}>
                    {metrics.lowStockCount}
                  </span>
                  <span className="text-[#5F6673]">Low Stock</span>
                  {metrics.lowStockCount > 0 && (
                    <span className="text-[9px] font-bold text-[#C2410C] bg-[#FEF2ED] border border-[#F9CBBA] px-1.5 py-0.5 rounded">
                      Action Required
                    </span>
                  )}
                </div>
                <span className="text-[#D6D6D0]">/</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-[#16794A]">payments</span>
                  <span className="font-bold text-[#16794A]">
                    ₹{metrics.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-[#5F6673]">Total Valuation</span>
                </div>
              </div>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg p-3 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined text-[16px] text-[#8E95A2] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product name, SKU, or category..."
                  className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded pl-8 pr-3 py-1.5 text-[12px] text-[#111318] placeholder:text-[#8E95A2] focus:outline-none focus:border-[#2457FF]"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded border transition-colors shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-[#2457FF] text-white border-[#2457FF]'
                      : 'bg-[#F4F4F1] text-[#5F6673] border-[#E5E5E0] hover:bg-[#EEEEEB]'
                  }`}
                >
                  All ({products.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors shrink-0 ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? 'bg-[#2457FF] text-white border-[#2457FF]'
                        : 'bg-[#F4F4F1] text-[#5F6673] border-[#E5E5E0] hover:bg-[#EEEEEB]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Catalog Master Table */}
            <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#ECECE8] bg-[#FAFAF8] text-[9px] font-bold uppercase tracking-wider text-[#8E95A2]">
                      <th className="px-4 py-2.5">SKU</th>
                      <th className="px-4 py-2.5">Product Name &amp; Category</th>
                      <th className="px-4 py-2.5">Stock Balance</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Base Unit</th>
                      <th className="px-4 py-2.5">Price</th>
                      <th className="px-4 py-2.5">Reorder Level</th>
                      <th className="px-4 py-2.5 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0EB] text-[12px]">
                    {filteredProducts.map((p) => {
                      const isLowStock = p.currentStock <= p.reorderLevel;

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-[#F9F9F7] transition-colors cursor-pointer"
                          onClick={() => openDrawer(p)}
                        >
                          {/* SKU */}
                          <td className="px-4 py-3 font-mono font-semibold text-[#5F6673] text-[11px]">
                            {p.sku}
                          </td>

                          {/* Name & Category */}
                          <td className="px-4 py-3">
                            <div className="font-bold text-[#111318]">{p.name}</div>
                            <div className="text-[10px] text-[#8E95A2]">{p.category}</div>
                          </td>

                          {/* Current Stock */}
                          <td className="px-4 py-3 font-mono text-[14px] font-bold text-[#111318]">
                            {p.currentStock}{' '}
                            <span className="text-[11px] font-normal text-[#5F6673]">{p.baseUnit}</span>
                          </td>

                          {/* Stock Health Badge */}
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${
                                isLowStock
                                  ? 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]'
                                  : 'bg-[#E8F4EC] text-[#16794A] border-[#C6E5D6]'
                              }`}
                            >
                              {isLowStock ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>

                          {/* Base Unit */}
                          <td className="px-4 py-3">
                            <span className="font-mono text-[#111318] font-semibold uppercase text-[11px]">
                              {p.baseUnit}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3 font-mono font-semibold text-[#111318]">
                            ₹{p.price}
                          </td>

                          {/* Reorder Level */}
                          <td className="px-4 py-3 font-mono text-[#5F6673]">
                            {p.reorderLevel} {p.baseUnit}
                          </td>

                          {/* Actions — stop propagation so clicking buttons doesn't open drawer */}
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Stock In */}
                              <button
                                onClick={() => openActionModal(p, 'STOCK_IN')}
                                title="Stock In"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E8F4EC] text-[#16794A] hover:bg-[#D4EDDA] border border-[#C6E5D6] rounded text-[11px] font-bold transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">add</span>
                                In
                              </button>

                              {/* Stock Out */}
                              <button
                                onClick={() => openActionModal(p, 'STOCK_OUT')}
                                title="Stock Out"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FEF2ED] text-[#C2410C] hover:bg-[#FDE8E0] border border-[#F9CBBA] rounded text-[11px] font-bold transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">remove</span>
                                Out
                              </button>

                              {/* Audit */}
                              <button
                                onClick={() => openActionModal(p, 'ADJUST')}
                                title="Physical Count Adjustment"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-[#F4F4F1] text-[#5F6673] hover:bg-[#EEEEEB] border border-[#E5E5E0] rounded text-[11px] font-semibold transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">tune</span>
                                Audit
                              </button>

                              {/* Details */}
                              <button
                                onClick={() => openDrawer(p)}
                                title="View Product Details"
                                className="inline-flex items-center p-1 text-[#8E95A2] hover:text-[#2457FF] hover:bg-[#EEF2FF] rounded transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredProducts.length === 0 && !loading && (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-[13px] text-[#8E95A2]">
                          No products found matching &ldquo;{searchQuery}&rdquo;.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. ADD PRODUCT MODAL */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#2457FF]">add_box</span>
                <h3 className="text-[13px] font-bold text-[#111318]">Create New Inventory Product</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#8E95A2] hover:text-[#111318] font-bold"
              >
                ✕
              </button>
            </div>

            {/* Error banner */}
            {addError && (
              <div className="mx-5 mt-4 p-2.5 bg-[#FEF2ED] border border-[#F9CBBA] rounded text-[12px] text-[#C2410C] font-semibold">
                {addError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Sona Masoori Rice, Freedom Oil"
                    className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] text-[#111318] focus:outline-none focus:border-[#2457FF]"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.sku}
                    onChange={(e) => setAddForm({ ...addForm, sku: e.target.value })}
                    placeholder="e.g. RICE-SM-25K"
                    className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] font-mono text-[#111318] uppercase focus:outline-none focus:border-[#2457FF]"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] text-[#111318] focus:outline-none focus:border-[#2457FF]"
                  >
                    <option value="Grains & Pulses">Grains & Pulses</option>
                    <option value="Staples">Staples</option>
                    <option value="Edible Oils">Edible Oils</option>
                    <option value="Essentials">Essentials</option>
                    <option value="Dairy">Dairy</option>
                    <option value="FMCG & Biscuits">FMCG & Biscuits</option>
                    <option value="Spices">Spices</option>
                  </select>
                </div>

                {/* Opening Stock */}
                <div>
                  <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                    Opening Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={addForm.openingStock}
                    onChange={(e) => setAddForm({ ...addForm, openingStock: e.target.value })}
                    className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] font-mono text-[#111318] focus:outline-none focus:border-[#2457FF]"
                  />
                </div>

                {/* Base Unit */}
                <div>
                  <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                    Base Unit *
                  </label>
                  <select
                    value={addForm.baseUnit}
                    onChange={(e) => setAddForm({ ...addForm, baseUnit: e.target.value })}
                    className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] text-[#111318] font-mono focus:outline-none focus:border-[#2457FF]"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="piece">piece (Pcs)</option>
                    <option value="litre">litre (L)</option>
                    <option value="packet">packet</option>
                    <option value="box">box</option>
                    <option value="bottle">bottle</option>
                    <option value="gram">gram</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                    Unit Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={addForm.price}
                    onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                    className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] font-mono text-[#111318] focus:outline-none focus:border-[#2457FF]"
                  />
                </div>

                {/* Reorder Level */}
                <div>
                  <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                    Reorder Alert Level *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={addForm.reorderLevel}
                    onChange={(e) => setAddForm({ ...addForm, reorderLevel: e.target.value })}
                    className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] font-mono text-[#111318] focus:outline-none focus:border-[#2457FF]"
                  />
                </div>

                {/* Expiry Date */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={addForm.expiryDate}
                    onChange={(e) => setAddForm({ ...addForm, expiryDate: e.target.value })}
                    className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] text-[#111318] focus:outline-none focus:border-[#2457FF]"
                  />
                </div>

                {/* TUNE Trade Unit Configuration */}
                <div className="sm:col-span-2 p-3 bg-[#F9F9F7] border border-[#E5E5E0] rounded">
                  <span className="text-[10px] font-bold text-[#111318] uppercase tracking-wider block mb-1">
                    Indian Trade Unit Normalization (TUNE)
                  </span>
                  <p className="text-[11px] text-[#5F6673] mb-2">
                    Configure custom trade conversions for vernacular commands (e.g. 1 Bag = 25 kg):
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#5F6673]">1</span>
                    <input
                      type="text"
                      value={addForm.customUnitName}
                      onChange={(e) => setAddForm({ ...addForm, customUnitName: e.target.value })}
                      placeholder="e.g. Bag, Katta, Dabba"
                      className="w-28 bg-[#FFFFFF] border border-[#E5E5E0] rounded px-2 py-1 text-[11px] text-[#111318]"
                    />
                    <span className="text-[11px] text-[#5F6673]">=</span>
                    <input
                      type="number"
                      min="0.001"
                      step="any"
                      value={addForm.customUnitValue}
                      onChange={(e) => setAddForm({ ...addForm, customUnitValue: e.target.value })}
                      className="w-20 bg-[#FFFFFF] border border-[#E5E5E0] rounded px-2 py-1 text-[11px] font-mono text-[#111318]"
                    />
                    <span className="text-[11px] font-mono text-[#111318]">{addForm.baseUnit}</span>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ECECE8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#F4F4F1] hover:bg-[#EEEEEB] text-[#111318] text-[12px] font-semibold border border-[#E5E5E0] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2457FF] hover:bg-[#003ED7] text-white text-[12px] font-bold rounded shadow-sm"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. STOCK IN MODAL */}
      {/* ======================================================== */}
      {actionType === 'STOCK_IN' && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] border border-[#C6E5D6] rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 border-b border-[#C6E5D6] bg-[#E8F4EC] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#16794A]">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <h3 className="text-[13px] font-bold">Stock Inward (Arrival)</h3>
              </div>
              <button onClick={closeActionModal} className="text-[#16794A] font-bold">✕</button>
            </div>

            {actionError && (
              <div className="mx-5 mt-4 p-2.5 bg-[#FEF2ED] border border-[#F9CBBA] rounded text-[12px] text-[#C2410C] font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleStockInSubmit} className="p-5 space-y-3">
              <div>
                <p className="text-[13px] font-bold text-[#111318]">{selectedProduct.name}</p>
                <p className="text-[11px] font-mono text-[#5F6673]">
                  SKU: {selectedProduct.sku} · Current Stock: <strong className="text-[#111318]">{selectedProduct.currentStock} {selectedProduct.baseUnit}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                    Incoming Quantity *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[13px] font-mono font-bold text-[#111318] focus:outline-none focus:border-[#16794A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                    Unit *
                  </label>
                  <select
                    value={unitInput}
                    onChange={(e) => setUnitInput(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] text-[#111318] focus:outline-none focus:border-[#16794A]"
                  >
                    <option value={selectedProduct.baseUnit}>{selectedProduct.baseUnit} (Base)</option>
                    {Object.entries(selectedProduct.unitConversions || {}).map(([u, factor]) => (
                      <option key={u} value={u}>
                        {u} (1 {u} = {factor} {selectedProduct.baseUnit})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                  Note / Challan Reference
                </label>
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="e.g. Supplier challan #401"
                  className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] text-[#111318]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ECECE8]">
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="px-3.5 py-1.5 bg-[#F4F4F1] hover:bg-[#EEEEEB] text-[#111318] text-[12px] font-semibold border border-[#E5E5E0] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#16794A] hover:bg-[#13663E] text-white text-[12px] font-bold rounded shadow-sm"
                >
                  Confirm Inward (+)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. STOCK OUT MODAL (WITH NEGATIVE BALANCE PROTECTION) */}
      {/* ======================================================== */}
      {actionType === 'STOCK_OUT' && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] border border-[#F9CBBA] rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 border-b border-[#F9CBBA] bg-[#FEF2ED] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#C2410C]">
                <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                <h3 className="text-[13px] font-bold">Stock Outward (Sale / Dispatch)</h3>
              </div>
              <button onClick={closeActionModal} className="text-[#C2410C] font-bold">✕</button>
            </div>

            {actionError && (
              <div className="mx-5 mt-4 p-2.5 bg-[#FEF2ED] border border-[#F9CBBA] rounded text-[12px] text-[#C2410C] font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleStockOutSubmit} className="p-5 space-y-3">
              <div>
                <p className="text-[13px] font-bold text-[#111318]">{selectedProduct.name}</p>
                <p className="text-[11px] font-mono text-[#5F6673]">
                  Available Balance: <strong className="text-[#111318]">{selectedProduct.currentStock} {selectedProduct.baseUnit}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                    Outgoing Quantity *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[13px] font-mono font-bold text-[#111318] focus:outline-none focus:border-[#C2410C]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                    Unit *
                  </label>
                  <select
                    value={unitInput}
                    onChange={(e) => setUnitInput(e.target.value)}
                    className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] text-[#111318] focus:outline-none focus:border-[#C2410C]"
                  >
                    <option value={selectedProduct.baseUnit}>{selectedProduct.baseUnit} (Base)</option>
                    {Object.entries(selectedProduct.unitConversions || {}).map(([u, factor]) => (
                      <option key={u} value={u}>
                        {u} (1 {u} = {factor} {selectedProduct.baseUnit})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                  Reason / Order Reference
                </label>
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="e.g. Customer counter sale"
                  className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] text-[#111318]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ECECE8]">
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="px-3.5 py-1.5 bg-[#F4F4F1] hover:bg-[#EEEEEB] text-[#111318] text-[12px] font-semibold border border-[#E5E5E0] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#C2410C] hover:bg-[#A3360A] text-white text-[12px] font-bold rounded shadow-sm"
                >
                  Confirm Outward (-)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. STOCK ADJUSTMENT MODAL */}
      {/* ======================================================== */}
      {actionType === 'ADJUST' && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-3 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#5F6673]">tune</span>
                <h3 className="text-[13px] font-bold text-[#111318]">Physical Stock Audit Adjustment</h3>
              </div>
              <button onClick={closeActionModal} className="text-[#8E95A2] hover:text-[#111318] font-bold">✕</button>
            </div>

            {actionError && (
              <div className="mx-5 mt-4 p-2.5 bg-[#FEF2ED] border border-[#F9CBBA] rounded text-[12px] text-[#C2410C] font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="p-5 space-y-3">
              <div>
                <p className="text-[13px] font-bold text-[#111318]">{selectedProduct.name}</p>
                <p className="text-[11px] font-mono text-[#5F6673]">
                  System Stock: <strong className="text-[#111318]">{selectedProduct.currentStock} {selectedProduct.baseUnit}</strong>
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                  Actual Physical Count ({selectedProduct.baseUnit}) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[13px] font-mono font-bold text-[#111318] focus:outline-none focus:border-[#2457FF]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                  Audit Reason / Notes
                </label>
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="e.g. Spillage write-off, count correction"
                  className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] text-[#111318]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ECECE8]">
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="px-3.5 py-1.5 bg-[#F4F4F1] hover:bg-[#EEEEEB] text-[#111318] text-[12px] font-semibold border border-[#E5E5E0] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2457FF] hover:bg-[#003ED7] text-white text-[12px] font-bold rounded shadow-sm"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. EDIT PRODUCT MODAL */}
      {/* ======================================================== */}
      {actionType === 'EDIT' && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-3 border-b border-[#ECECE8] bg-[#F4F4F1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#2457FF]">edit</span>
                <h3 className="text-[13px] font-bold text-[#111318]">Edit Product Details</h3>
              </div>
              <button onClick={closeActionModal} className="text-[#8E95A2] hover:text-[#111318] font-bold">✕</button>
            </div>

            {actionError && (
              <div className="mx-5 mt-4 p-2.5 bg-[#FEF2ED] border border-[#F9CBBA] rounded text-[12px] text-[#C2410C] font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] text-[#111318]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] font-mono text-[#111318]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                    Reorder Alert Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editForm.reorderLevel}
                    onChange={(e) => setEditForm({ ...editForm, reorderLevel: e.target.value })}
                    className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] font-mono text-[#111318]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={editForm.expiryDate}
                  onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                  className="w-full bg-[#F4F4F1] border border-[#E5E5E0] rounded px-3 py-1.5 text-[12px] text-[#111318]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#ECECE8]">
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="px-3.5 py-1.5 bg-[#F4F4F1] hover:bg-[#EEEEEB] text-[#111318] text-[12px] font-semibold border border-[#E5E5E0] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2457FF] hover:bg-[#003ED7] text-white text-[12px] font-bold rounded shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Drawer (Slide-over) */}
      <ProductDetailDrawer
        product={drawerProduct}
        onClose={closeDrawer}
        onStockIn={(p) => openFromDrawer(p, 'STOCK_IN')}
        onStockOut={(p) => openFromDrawer(p, 'STOCK_OUT')}
        onAudit={(p) => openFromDrawer(p, 'ADJUST')}
        onEdit={(p) => openFromDrawer(p, 'EDIT')}
      />
    </div>
  );
}

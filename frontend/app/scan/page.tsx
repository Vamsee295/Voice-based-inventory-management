'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../home/components/Sidebar';
import AppHeader from '../home/components/AppHeader';
import { Product } from '../../lib/inventory/models/product';
import { ReorderRecord } from '../../lib/inventory/models/reorder';
import { InventoryTransaction } from '../../lib/inventory/models/transaction';
import { ScanOperationType, barcodeService } from '../../lib/inventory/services/barcodeService';
import { unitService } from '../../lib/inventory/units/unitService';

export default function ScanPage() {
  const [operationMode, setOperationMode] = useState<ScanOperationType>('STOCK_IN');
  const [scannedCode, setScannedCode] = useState('');
  
  // Resolution state
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedProduct, setResolvedProduct] = useState<Product | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  
  // Input fields for processing
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [linkedPoId, setLinkedPoId] = useState<string>('');
  
  // PO options
  const [pendingPOs, setPendingPOs] = useState<ReorderRecord[]>([]);
  
  // Transaction history
  const [recentTransactions, setRecentTransactions] = useState<InventoryTransaction[]>([]);

  // Processing state
  const [isCommitting, setIsCommitting] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on load and keep focus for hardware scanner
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [operationMode]);

  useEffect(() => {
    if (operationMode === 'PO_RECEIVE') {
      barcodeService.getPendingPurchaseOrders().then(pos => setPendingPOs(pos));
    } else {
      setPendingPOs([]);
      setLinkedPoId('');
    }
  }, [operationMode]);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode.trim()) return;
    
    setIsResolving(true);
    setScanError(null);
    setResolvedProduct(null);
    setQuantity(1);
    setBatchNumber('');
    setExpiryDate('');
    
    try {
      const product = await barcodeService.resolveBarcode(scannedCode);
      if (product) {
        setResolvedProduct(product);
        setSelectedUnit(product.baseUnit);
        if (inputRef.current) inputRef.current.blur(); // Release focus after valid scan
      } else {
        setScanError(`No product found for barcode / SKU: ${scannedCode}`);
      }
    } catch (err) {
      setScanError('Failed to resolve barcode.');
    } finally {
      setIsResolving(false);
    }
  };

  const handleTestTrigger = (barcode: string) => {
    setScannedCode(barcode);
    setTimeout(() => {
      // simulate enter key press or form submit
      const form = document.getElementById('scan-form') as HTMLFormElement;
      if (form) form.requestSubmit();
    }, 50);
  };

  const handleClear = () => {
    setScannedCode('');
    setResolvedProduct(null);
    setScanError(null);
    setBatchNumber('');
    setExpiryDate('');
    setQuantity(1);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleCommit = async () => {
    if (!resolvedProduct) return;
    
    setIsCommitting(true);
    setScanError(null);
    
    const result = await barcodeService.commitScanOperation({
      productId: resolvedProduct.id,
      operationType: operationMode,
      quantity,
      unit: selectedUnit,
      batchNumber: batchNumber || undefined,
      expiryDate: expiryDate || undefined,
      linkedPoId: linkedPoId || undefined,
      createdBy: 'Suresh R.',
    });
    
    if (result.success && result.transaction) {
      setRecentTransactions(prev => [result.transaction!, ...prev].slice(0, 5));
      handleClear(); // reset form on success
      
      // Flash success briefly (could use a toast)
      // alert(`Success! Operation committed. Tx: ${result.transaction.id}`);
      
      if (operationMode === 'PO_RECEIVE') {
        barcodeService.getPendingPurchaseOrders().then(pos => setPendingPOs(pos));
      }
    } else {
      setScanError(result.error || 'Failed to commit operation.');
    }
    
    setIsCommitting(false);
  };

  // Calculations for preview
  let normalizedQty = 0;
  let projectedStock = 0;
  
  if (resolvedProduct) {
    const norm = unitService.normalize(resolvedProduct, quantity || 0, selectedUnit || resolvedProduct.baseUnit);
    normalizedQty = norm?.normalizedQuantity ?? 0;
    
    if (operationMode === 'STOCK_IN' || operationMode === 'PO_RECEIVE') {
      projectedStock = Number((resolvedProduct.currentStock + normalizedQty).toFixed(3));
    } else if (operationMode === 'STOCK_OUT') {
      projectedStock = Number((resolvedProduct.currentStock - normalizedQty).toFixed(3));
    } else if (operationMode === 'AUDIT_COUNT') {
      // In Audit mode, the operator enters the NEW absolute physical stock (often in base unit)
      projectedStock = Number(normalizedQty.toFixed(3));
    }
  }

  const isStockOutInvalid = operationMode === 'STOCK_OUT' && projectedStock < 0;
  const canCommit = resolvedProduct && quantity > 0 && !isStockOutInvalid && !isCommitting;

  return (
    <div className="flex h-screen bg-[#F7F7F4] font-sans text-[#111318] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader title="Scan & Barcode" description="Process items via hardware scanner" />

        <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-[#E5E5E0] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[20px] text-[#2457FF]">barcode_scanner</span>
                <h1 className="text-[18px] font-bold text-[#111318] tracking-tight">Scan / Barcode / PO</h1>
              </div>
              <p className="text-[12px] text-[#5F6673]">Hardware scanning and PO fulfillment operational console.</p>
            </div>
            
            {/* Mode Selector */}
            <div className="flex bg-[#E5E5E0] p-1 rounded-md mt-4 md:mt-0">
              <button 
                onClick={() => setOperationMode('STOCK_IN')}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-sm transition-colors ${operationMode === 'STOCK_IN' ? 'bg-[#FFFFFF] text-[#16794A] shadow-sm' : 'text-[#5F6673] hover:bg-[#F4F4F1]'}`}
              >
                STOCK IN
              </button>
              <button 
                onClick={() => setOperationMode('STOCK_OUT')}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-sm transition-colors ${operationMode === 'STOCK_OUT' ? 'bg-[#FFFFFF] text-[#C2410C] shadow-sm' : 'text-[#5F6673] hover:bg-[#F4F4F1]'}`}
              >
                STOCK OUT
              </button>
              <button 
                onClick={() => setOperationMode('PO_RECEIVE')}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-sm transition-colors ${operationMode === 'PO_RECEIVE' ? 'bg-[#FFFFFF] text-[#2457FF] shadow-sm' : 'text-[#5F6673] hover:bg-[#F4F4F1]'}`}
              >
                RECEIVE PO
              </button>
              <button 
                onClick={() => setOperationMode('AUDIT_COUNT')}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-sm transition-colors ${operationMode === 'AUDIT_COUNT' ? 'bg-[#FFFFFF] text-[#111318] shadow-sm' : 'text-[#5F6673] hover:bg-[#F4F4F1]'}`}
              >
                AUDIT COUNT
              </button>
            </div>
          </div>

          {/* Operational Console Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Panel: Scanner Input */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[16px] text-[#8E95A2]">qr_code_scanner</span>
                  <h3 className="text-[13px] font-bold text-[#111318]">Scanner Console</h3>
                </div>
                
                <form id="scan-form" onSubmit={handleScanSubmit} className="mb-5">
                  <label className="block text-[11px] font-bold text-[#5F6673] mb-1">BARCODE / SKU</label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={scannedCode}
                      onChange={(e) => setScannedCode(e.target.value)}
                      placeholder="Scan or type barcode..."
                      className="w-full h-[42px] px-3 bg-[#F9F9F8] border border-[#E5E5E0] rounded-md text-[14px] font-mono focus:outline-none focus:border-[#2457FF] focus:ring-1 focus:ring-[#2457FF]"
                      disabled={isResolving}
                    />
                    <button 
                      type="submit"
                      disabled={isResolving || !scannedCode.trim()}
                      className="absolute right-1 top-1 bottom-1 bg-[#2457FF] hover:bg-[#1D4ED8] text-white rounded px-3 text-[12px] font-bold disabled:opacity-50 transition-colors"
                    >
                      {isResolving ? '...' : 'SCAN'}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#8E95A2] mt-2">Ready for hardware scanner input (auto-submits on Enter).</p>
                </form>

                <div className="pt-4 border-t border-[#E5E5E0]">
                  <p className="text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-2">Simulated Triggers</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleTestTrigger('8901030383801')} className="px-2 py-1 bg-[#F4F4F1] border border-[#E5E5E0] hover:border-[#2457FF] text-[#111318] text-[11px] rounded transition-colors">Rice (8901030383801)</button>
                    <button onClick={() => handleTestTrigger('8901030383802')} className="px-2 py-1 bg-[#F4F4F1] border border-[#E5E5E0] hover:border-[#2457FF] text-[#111318] text-[11px] rounded transition-colors">Sugar (8901030383802)</button>
                    <button onClick={() => handleTestTrigger('8901058852654')} className="px-2 py-1 bg-[#F4F4F1] border border-[#E5E5E0] hover:border-[#2457FF] text-[#111318] text-[11px] rounded transition-colors">Salt (8901058852654)</button>
                    <button onClick={() => handleTestTrigger('UNKNOWN999')} className="px-2 py-1 bg-[#FEF2ED] border border-[#F9CBBA] hover:border-[#C2410C] text-[#C2410C] text-[11px] rounded transition-colors">Unknown</button>
                  </div>
                </div>
              </div>

              {/* Recent Scans Mini Ledger */}
              {recentTransactions.length > 0 && (
                <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg p-4 shadow-sm flex-1">
                  <h3 className="text-[11px] font-bold text-[#8E95A2] uppercase tracking-wider mb-3">Recent Shift Scans</h3>
                  <div className="space-y-2">
                    {recentTransactions.map(tx => (
                      <div key={tx.id} className="flex justify-between items-center p-2 bg-[#F9F9F8] rounded border border-[#E5E5E0]">
                        <div>
                          <p className="text-[12px] font-bold text-[#111318] truncate w-[160px]">{tx.productName}</p>
                          <p className="text-[10px] text-[#5F6673]">{tx.type} • {new Date(tx.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-[12px] font-bold ${tx.type === 'STOCK_IN' || tx.type === 'ADJUSTMENT' && tx.quantity >= 0 ? 'text-[#16794A]' : 'text-[#C2410C]'}`}>
                            {tx.type === 'STOCK_OUT' ? '-' : '+'}{tx.quantity} {tx.unit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Center & Right Panel: Resolution & Processing */}
            <div className="lg:col-span-8">
              {!resolvedProduct ? (
                <div className="bg-[#FFFFFF] border border-[#E5E5E0] border-dashed rounded-lg h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
                  <span className="material-symbols-outlined text-[48px] text-[#D6D6D0] mb-4">document_scanner</span>
                  <h2 className="text-[15px] font-bold text-[#111318] mb-1">Waiting for scan</h2>
                  <p className="text-[13px] text-[#5F6673] max-w-[300px]">Scan a barcode or enter a SKU to load product details and configure operational impact.</p>
                  
                  {scanError && (
                    <div className="mt-6 bg-[#FEF2ED] border border-[#F9CBBA] text-[#C2410C] px-4 py-2 rounded-md flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      <span className="text-[12px] font-medium">{scanError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg shadow-sm flex flex-col h-full">
                  {/* Identity Header */}
                  <div className="p-5 border-b border-[#E5E5E0] flex justify-between items-start bg-[#FAFAF8]">
                    <div>
                      <div className="flex gap-2 items-center mb-1">
                        <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#2457FF] text-[10px] font-bold tracking-wider rounded border border-[#D0DDFF]">
                          MATCHED
                        </span>
                        <span className="text-[12px] text-[#5F6673] font-mono">{resolvedProduct.sku}</span>
                      </div>
                      <h2 className="text-[20px] font-bold text-[#111318]">{resolvedProduct.name}</h2>
                      <p className="text-[12px] text-[#8E95A2]">Category: {resolvedProduct.category} {resolvedProduct.barcode ? `• Barcode: ${resolvedProduct.barcode}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-[#8E95A2] uppercase tracking-wider mb-1">Current Stock</p>
                      <p className="text-[24px] font-bold text-[#111318] leading-none">{resolvedProduct.currentStock} <span className="text-[14px] text-[#5F6673] font-normal">{resolvedProduct.baseUnit}</span></p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row flex-1">
                    {/* Center: Configuration */}
                    <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-[#E5E5E0]">
                      <h3 className="text-[11px] font-bold text-[#8E95A2] uppercase tracking-wider mb-4">Operation Configuration</h3>
                      
                      {operationMode === 'PO_RECEIVE' && (
                        <div className="mb-5 bg-[#EEF2FF] border border-[#D0DDFF] rounded-md p-3">
                          <label className="block text-[11px] font-bold text-[#2457FF] mb-1">LINK PURCHASE ORDER</label>
                          {pendingPOs.length === 0 ? (
                            <p className="text-[12px] text-[#5F6673]">No pending purchase orders available.</p>
                          ) : (
                            <select
                              value={linkedPoId}
                              onChange={(e) => setLinkedPoId(e.target.value)}
                              className="w-full h-8 px-2 bg-white border border-[#D0DDFF] rounded text-[13px] text-[#111318] focus:outline-none focus:border-[#2457FF]"
                            >
                              <option value="">-- Select PO to Link --</option>
                              {pendingPOs.map(po => (
                                <option key={po.id} value={po.id}>
                                  {po.id} ({po.productName}) - {po.quantity} {po.unit}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                          <label className="block text-[11px] font-bold text-[#5F6673] mb-1">QUANTITY</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={quantity || ''}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full h-9 px-3 border border-[#E5E5E0] rounded text-[14px] font-mono focus:outline-none focus:border-[#2457FF]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#5F6673] mb-1">UNIT</label>
                          <select
                            value={selectedUnit}
                            onChange={(e) => setSelectedUnit(e.target.value)}
                            className="w-full h-9 px-2 border border-[#E5E5E0] rounded text-[14px] focus:outline-none focus:border-[#2457FF]"
                          >
                            <option value={resolvedProduct.baseUnit}>{resolvedProduct.baseUnit} (Base)</option>
                            {Object.keys(resolvedProduct.unitConversions || {}).map(u => (
                              <option key={u} value={u}>{u} (x{resolvedProduct.unitConversions![u]})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {(operationMode === 'STOCK_IN' || operationMode === 'PO_RECEIVE') && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5E5E0]">
                          <div>
                            <label className="block text-[11px] font-bold text-[#5F6673] mb-1">BATCH NO. (OPTIONAL)</label>
                            <input
                              type="text"
                              value={batchNumber}
                              onChange={(e) => setBatchNumber(e.target.value)}
                              placeholder="e.g. BT-992"
                              className="w-full h-9 px-3 border border-[#E5E5E0] rounded text-[13px] focus:outline-none focus:border-[#2457FF]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#5F6673] mb-1">EXPIRY DATE (OPTIONAL)</label>
                            <input
                              type="date"
                              value={expiryDate}
                              onChange={(e) => setExpiryDate(e.target.value)}
                              className="w-full h-9 px-3 border border-[#E5E5E0] rounded text-[13px] focus:outline-none focus:border-[#2457FF]"
                            />
                          </div>
                        </div>
                      )}
                      
                      {operationMode === 'AUDIT_COUNT' && (
                        <div className="bg-[#F4F4F1] border border-[#E5E5E0] p-3 rounded-md mt-2">
                          <p className="text-[11px] text-[#5F6673]">
                            <strong>Note:</strong> In Audit mode, enter the <span className="text-[#111318] font-bold">Total Physical Stock</span> counted on the shelf. The system will auto-calculate the adjustment delta.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Preview & Action */}
                    <div className="w-full md:w-[280px] p-5 bg-[#FAFAF8] flex flex-col justify-between">
                      <div>
                        <h3 className="text-[11px] font-bold text-[#8E95A2] uppercase tracking-wider mb-4">Impact Preview</h3>
                        
                        <div className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-md p-3 mb-4 shadow-sm text-center">
                          <p className="text-[10px] text-[#8E95A2] uppercase tracking-wider mb-1">Projected Stock</p>
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-[14px] text-[#5F6673] line-through">{resolvedProduct.currentStock}</span>
                            <span className="material-symbols-outlined text-[16px] text-[#8E95A2]">arrow_forward</span>
                            <span className={`text-[20px] font-bold ${isStockOutInvalid ? 'text-[#C2410C]' : 'text-[#16794A]'}`}>
                              {projectedStock}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-[#8E95A2] mt-2 bg-[#F4F4F1] inline-block px-1 rounded">
                            {operationMode === 'STOCK_OUT' ? '-' : '+'}{normalizedQty} {resolvedProduct.baseUnit}
                          </p>
                        </div>

                        {scanError && (
                          <div className="mb-4 bg-[#FEF2ED] border border-[#F9CBBA] text-[#C2410C] px-3 py-2 rounded text-[11px] font-medium leading-tight">
                            {scanError}
                          </div>
                        )}
                        
                        {isStockOutInvalid && (
                          <div className="mb-4 bg-[#FEF2ED] border border-[#F9CBBA] text-[#C2410C] px-3 py-2 rounded text-[11px] font-medium leading-tight flex items-start gap-1">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            Insufficient stock! Operation blocked to prevent negative inventory.
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleCommit}
                          disabled={!canCommit}
                          className="w-full bg-[#2457FF] hover:bg-[#1D4ED8] text-white py-3 rounded-md text-[13px] font-bold disabled:opacity-50 disabled:bg-[#8E95A2] transition-colors shadow-sm flex justify-center items-center gap-2"
                        >
                          {isCommitting ? (
                            <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                          ) : (
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          )}
                          CONFIRM & COMMIT
                        </button>
                        <button
                          onClick={handleClear}
                          className="w-full bg-[#FFFFFF] border border-[#E5E5E0] hover:bg-[#F4F4F1] text-[#5F6673] py-2 rounded-md text-[12px] font-bold transition-colors"
                        >
                          DISCARD
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

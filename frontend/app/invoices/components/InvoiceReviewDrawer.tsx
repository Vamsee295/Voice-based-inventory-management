'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceDocument, InvoiceItem } from '../../../lib/inventory/models/document';
import { documentProcessingService } from '../../../lib/inventory/services/documentProcessingService';
import { productMatchingService } from '../../../lib/inventory/services/productMatchingService';
import { inventoryService } from '../../../lib/inventory/services/inventoryService';
import { Product } from '../../../lib/inventory/models/product';

interface InvoiceReviewDrawerProps {
  document: InvoiceDocument | null;
  onClose: () => void;
  onApplied: () => void;
  operatorName: string;
}

export default function InvoiceReviewDrawer({ document, onClose, onApplied, operatorName }: InvoiceReviewDrawerProps) {
  const [doc, setDoc] = useState<InvoiceDocument | null>(document);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Provide projected inventory states
  const [projectedInventory, setProjectedInventory] = useState<Record<string, number>>({});
  const [baseUnits, setBaseUnits] = useState<Record<string, string>>({});
  const [currentInventory, setCurrentInventory] = useState<Record<string, number>>({});

  useEffect(() => {
    setDoc(document);
  }, [document]);

  useEffect(() => {
    if (!doc) return;

    const fetchInventory = async () => {
      const proj: Record<string, number> = {};
      const curr: Record<string, number> = {};
      const bases: Record<string, string> = {};

      for (const item of doc.items) {
        if (item.matchedProductId) {
          const prod = await inventoryService.getProductById(item.matchedProductId);
          if (prod) {
            curr[prod.id] = prod.currentStock;
            proj[prod.id] = prod.currentStock + (item.normalizedQuantity || 0);
            bases[prod.id] = prod.baseUnit;
          }
        }
      }
      setCurrentInventory(curr);
      setProjectedInventory(proj);
      setBaseUnits(bases);
    };

    fetchInventory();
  }, [doc]);

  if (!doc) return null;

  const handleApply = async () => {
    try {
      setIsApplying(true);
      setError(null);
      await documentProcessingService.confirmAndApply(doc.id, operatorName);
      onApplied();
    } catch (err: any) {
      setError(err.message || 'Failed to apply document.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleMatchSelect = async (itemId: string, candidateId: string) => {
    const item = doc.items.find(i => i.id === itemId);
    if (!item) return;

    const product = await inventoryService.getProductById(candidateId);
    if (!product) return;

    const newItem = { ...item };
    productMatchingService.applyProductMatch(newItem, product);

    const newDoc = {
      ...doc,
      items: doc.items.map(i => i.id === itemId ? newItem : i)
    };
    
    // Re-evaluate status
    const hasUncertainties = newDoc.items.some(i => i.matchConfidence === 'UNCERTAIN' || i.matchConfidence === 'NONE' || (i.validationErrors && i.validationErrors.length > 0));
    newDoc.status = hasUncertainties ? 'REVIEW_REQUIRED' : 'READY_TO_APPLY';
    
    setDoc(newDoc);
  };

  const isApplied = doc.status === 'APPLIED';
  const isReady = doc.status === 'READY_TO_APPLY';
  const hasErrors = doc.items.some(i => i.validationErrors && i.validationErrors.length > 0);

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#111318]/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#F7F7F4] shadow-2xl z-50 flex flex-col border-l border-[#E5E5E0] animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-[#FFFFFF] px-6 py-4 flex items-center justify-between border-b border-[#E5E5E0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`material-symbols-outlined text-[20px] ${doc.documentType === 'CHALLAN' ? 'text-[#2457FF]' : 'text-[#16794A]'}`}>
                {doc.documentType === 'CHALLAN' ? 'local_shipping' : 'receipt'}
              </span>
              <h2 className="text-[16px] font-bold text-[#111318]">Document Review</h2>
              {isApplied && (
                <span className="ml-2 text-[10px] font-bold bg-[#F4F4F1] text-[#5F6673] px-2 py-0.5 rounded border border-[#E5E5E0]">
                  ALREADY APPLIED
                </span>
              )}
            </div>
            <p className="text-[12px] text-[#5F6673]">
              {doc.supplierName} • {doc.documentNumber} • {new Date(doc.documentDate).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-[#8E95A2] hover:bg-[#E5E5E0] hover:text-[#111318] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {error && (
            <div className="bg-[#FEF2ED] border border-[#F9CBBA] rounded-lg p-4 flex gap-3 text-[#C2410C]">
              <span className="material-symbols-outlined">error</span>
              <p className="text-[13px] font-medium">{error}</p>
            </div>
          )}

          {/* Validation Summary */}
          <div className={`border rounded-lg p-4 flex items-start gap-3 ${hasErrors ? 'bg-[#FEF2ED] border-[#F9CBBA] text-[#C2410C]' : 'bg-[#EDF7F2] border-[#C3E4D1] text-[#16794A]'}`}>
            <span className="material-symbols-outlined text-[20px] mt-0.5">
              {hasErrors ? 'warning' : 'check_circle'}
            </span>
            <div>
              <h3 className="text-[13px] font-bold mb-1">
                {hasErrors ? 'REVIEW REQUIRED' : 'DOCUMENT VALIDATED'}
              </h3>
              <p className="text-[12px] opacity-90">
                {hasErrors 
                  ? 'Please resolve unmatched SKUs and missing conversions before applying stock.'
                  : 'All items matched to Master Catalog. Ready to inject into live inventory.'}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-[12px] font-bold text-[#8E95A2] uppercase tracking-widest mb-3">Extracted Items</h3>
            
            <div className="space-y-4">
              {doc.items.map(item => (
                <div key={item.id} className="bg-[#FFFFFF] border border-[#E5E5E0] rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[14px] font-semibold text-[#111318]">{item.rawDescription}</p>
                      <p className="text-[11px] text-[#5F6673]">Extracted: {item.quantity} {item.unit}</p>
                    </div>
                    {item.batchNumber && (
                      <div className="flex items-center gap-1.5 bg-[#F0F4FF] border border-[#C7D6FF] text-[#2457FF] px-2 py-1 rounded">
                        <span className="material-symbols-outlined text-[14px]">science</span>
                        <span className="text-[11px] font-bold">{item.batchNumber} (Exp: {item.expiryDate})</span>
                      </div>
                    )}
                  </div>

                  {/* Errors */}
                  {item.validationErrors && item.validationErrors.length > 0 && (
                    <div className="mb-3">
                      {item.validationErrors.map((err, i) => (
                        <div key={i} className="text-[11px] font-medium text-[#C2410C] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">error</span>
                          {err}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching Section */}
                  {item.matchConfidence === 'UNCERTAIN' && item.candidateMatches ? (
                    <div className="bg-[#F9F9F7] border border-[#E5E5E0] rounded p-3">
                      <p className="text-[11px] font-semibold text-[#111318] mb-2">Select matching product:</p>
                      <div className="flex flex-col gap-2">
                        {item.candidateMatches.map(c => (
                          <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="radio" 
                              name={`match-${item.id}`} 
                              checked={item.matchedProductId === c.id}
                              onChange={() => handleMatchSelect(item.id, c.id)}
                              className="accent-[#2457FF]"
                              disabled={isApplied}
                            />
                            <span className="text-[12px] font-medium text-[#5F6673] group-hover:text-[#111318]">
                              {c.name} <span className="font-mono text-[10px]">({c.sku})</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : item.matchedProductId ? (
                    <div className="bg-[#F9F9F7] border border-[#E5E5E0] rounded p-3 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="material-symbols-outlined text-[14px] text-[#16794A]">check_circle</span>
                          <span className="text-[12px] font-semibold text-[#111318]">{item.matchedProductName}</span>
                          <span className="text-[10px] font-mono text-[#8E95A2] bg-[#ECECE8] px-1 rounded">{item.matchedSku}</span>
                        </div>
                        {item.tuneConversionNote && (
                          <p className="text-[11px] text-[#5F6673] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">sync_alt</span>
                            TUNE: {item.tuneConversionNote}
                          </p>
                        )}
                      </div>
                      
                      {/* Inventory Impact */}
                      {currentInventory[item.matchedProductId] !== undefined && (
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-[#8E95A2] uppercase tracking-wider mb-0.5">Impact</p>
                          <div className="flex items-center gap-1.5 text-[12px] font-mono">
                            <span className="text-[#5F6673]">{currentInventory[item.matchedProductId]}</span>
                            <span className="material-symbols-outlined text-[12px] text-[#8E95A2]">arrow_forward</span>
                            <span className="font-bold text-[#16794A]">
                              {projectedInventory[item.matchedProductId]} {baseUnits[item.matchedProductId]}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#FFFFFF] border-t border-[#E5E5E0] px-6 py-4 flex items-center justify-between">
          <p className="text-[11px] text-[#8E95A2]">
            {isApplied 
              ? `Document applied by ${operatorName}. Inventory updated.` 
              : 'Review changes. No inventory will be modified until confirmed.'}
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-bold text-[#5F6673] hover:bg-[#F4F4F1] rounded-md transition-colors"
            >
              Close
            </button>
            {!isApplied && (
              <button
                onClick={handleApply}
                disabled={!isReady || isApplying}
                className={`px-6 py-2 rounded-md text-[13px] font-bold flex items-center gap-2 transition-colors ${
                  isReady && !isApplying
                    ? 'bg-[#2457FF] text-[#FFFFFF] hover:bg-[#1D4ED8] shadow-sm'
                    : 'bg-[#E5E5E0] text-[#A0A5AF] cursor-not-allowed'
                }`}
              >
                {isApplying ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Applying...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    CONFIRM & APPLY
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

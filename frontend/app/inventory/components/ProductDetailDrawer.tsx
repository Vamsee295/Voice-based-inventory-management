'use client';

import { useEffect, useState } from 'react';
import { Product } from '../../../lib/inventory/models/product';
import { InventoryTransaction } from '../../../lib/inventory/models/transaction';
import { inventoryService } from '../../../lib/inventory/services/inventoryService';
import { transactionRepository } from '../../../lib/inventory/repositories/transactionRepository';

interface ProductDetailDrawerProps {
  product: Product | null;
  onClose: () => void;
  onStockIn: (product: Product) => void;
  onStockOut: (product: Product) => void;
  onAudit: (product: Product) => void;
  onEdit: (product: Product) => void;
}

export default function ProductDetailDrawer({
  product,
  onClose,
  onStockIn,
  onStockOut,
  onAudit,
  onEdit,
}: ProductDetailDrawerProps) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Load and subscribe to recent transactions for this product
  useEffect(() => {
    if (!product?.id) {
      setTransactions([]);
      return;
    }

    const loadTx = () => {
      inventoryService.getTransactions(product.id, 6).then(setTransactions);
    };

    loadTx();
    const unsubscribe = transactionRepository.subscribe(loadTx);
    return unsubscribe;
  }, [product?.id]);

  if (!product) return null;

  const isLowStock = product.currentStock <= product.reorderLevel;
  const stockPct = Math.min(
    100,
    product.reorderLevel > 0
      ? Math.round((product.currentStock / (product.reorderLevel * 3)) * 100)
      : 100
  );
  const customConversions = Object.entries(product.unitConversions || {});

  const createdAt = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const updatedAt = product.updatedAt
    ? new Date(product.updatedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-[#FFFFFF] border-l border-[#E5E5E0] shadow-2xl z-50 flex flex-col overflow-hidden"
        role="dialog"
        aria-label={`Product detail: ${product.name}`}
      >
        {/* Drawer Header */}
        <div className="px-5 py-3.5 border-b border-[#E5E5E0] bg-[#F4F4F1] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[16px] text-[#5F6673]">
              inventory_2
            </span>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#111318]">
              Product Detail
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-[#5F6673] hover:bg-[#E5E5E0] transition-colors"
            aria-label="Close drawer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Product Identity */}
          <div className="px-5 py-4 border-b border-[#F0F0EB]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] font-bold text-[#111318] leading-snug">{product.name}</h2>
                <p className="text-[11px] text-[#5F6673] mt-0.5">{product.category}</p>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border shrink-0 ${
                  isLowStock
                    ? 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]'
                    : 'bg-[#E8F4EC] text-[#16794A] border-[#C6E5D6]'
                }`}
              >
                {isLowStock ? 'Low Stock' : 'In Stock'}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#8E95A2] block">
                  SKU
                </span>
                <span className="text-[12px] font-mono font-semibold text-[#111318]">
                  {product.sku}
                </span>
              </div>
              <div className="w-px h-8 bg-[#E5E5E0]" />
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#8E95A2] block">
                  Created
                </span>
                <span className="text-[11px] text-[#5F6673]">{createdAt}</span>
              </div>
              <div className="w-px h-8 bg-[#E5E5E0]" />
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#8E95A2] block">
                  Updated
                </span>
                <span className="text-[11px] text-[#5F6673]">{updatedAt}</span>
              </div>
            </div>
          </div>

          {/* Live Stock Balance */}
          <div className="px-5 py-4 border-b border-[#F0F0EB]">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8E95A2] mb-2.5">
              Live Stock Balance
            </p>
            <div className="flex items-end justify-between mb-1.5">
              <span className="text-[26px] font-bold font-mono text-[#111318] leading-none">
                {product.currentStock}
                <span className="text-[14px] font-normal text-[#5F6673] ml-1">{product.baseUnit}</span>
              </span>
              <div className="text-right">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E95A2] block">
                  Reorder at
                </span>
                <span className="text-[13px] font-mono text-[isLowStock ? '#C2410C' : '#5F6673']">
                  {product.reorderLevel} {product.baseUnit}
                </span>
              </div>
            </div>

            {/* Stock gauge */}
            <div className="h-1.5 bg-[#F0F0EB] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isLowStock ? 'bg-[#C2410C]' : 'bg-[#16794A]'
                }`}
                style={{ width: `${stockPct}%` }}
              />
            </div>
            {isLowStock && (
              <p className="text-[10px] text-[#C2410C] font-semibold mt-1">
                ⚠ Below reorder threshold — replenishment recommended
              </p>
            )}
          </div>

          {/* Pricing */}
          <div className="px-5 py-4 border-b border-[#F0F0EB]">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8E95A2] mb-2.5">
              Pricing
            </p>
            <div className="flex gap-6">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E95A2] block mb-0.5">
                  Unit Price
                </span>
                <span className="text-[15px] font-bold font-mono text-[#111318]">
                  ₹{product.price.toLocaleString('en-IN')} / {product.baseUnit}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E95A2] block mb-0.5">
                  Stock Valuation
                </span>
                <span className="text-[15px] font-bold font-mono text-[#16794A]">
                  ₹
                  {(product.price * product.currentStock).toLocaleString('en-IN', {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* TUNE Trade Units */}
          {customConversions.length > 0 && (
            <div className="px-5 py-4 border-b border-[#F0F0EB]">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#8E95A2] mb-2.5">
                TUNE Trade Units (Configured)
              </p>
              <div className="flex flex-col gap-1.5">
                {customConversions.map(([unitName, factor]) => (
                  <div
                    key={unitName}
                    className="flex items-center gap-3 p-2 bg-[#F9F9F7] border border-[#E5E5E0] rounded"
                  >
                    <span className="material-symbols-outlined text-[14px] text-[#2457FF]">
                      compare_arrows
                    </span>
                    <span className="text-[12px] font-semibold text-[#111318]">1 {unitName}</span>
                    <span className="text-[11px] text-[#8E95A2]">=</span>
                    <span className="text-[12px] font-bold font-mono text-[#2457FF]">
                      {factor} {product.baseUnit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expiry */}
          {product.expiryDate && (
            <div className="px-5 py-4 border-b border-[#F0F0EB]">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#8E95A2] mb-2.5">
                Shelf Life
              </p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] text-[#B45309]">schedule</span>
                <span className="text-[12px] font-semibold text-[#B45309]">
                  Expires:{' '}
                  {new Date(product.expiryDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Recent SKU Transactions */}
          <div className="px-5 py-4 border-b border-[#F0F0EB]">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#8E95A2]">
                Recent SKU Activity
              </p>
              <span className="text-[9px] font-mono text-[#5F6673]">
                {transactions.length} record{transactions.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="divide-y divide-[#F0F0EB]">
              {transactions.slice(0, 5).map((tx) => {
                const isPositive =
                  tx.type === 'STOCK_IN' ||
                  (tx.type === 'ADJUSTMENT' && tx.newStock >= tx.previousStock);
                const deltaVal =
                  tx.type === 'STOCK_IN'
                    ? tx.normalizedQuantity
                    : tx.type === 'STOCK_OUT'
                    ? -tx.normalizedQuantity
                    : tx.newStock - tx.previousStock;

                const typeBadgeClass =
                  tx.type === 'STOCK_IN'
                    ? 'bg-[#E8F4EC] text-[#16794A] border-[#C6E5D6]'
                    : tx.type === 'STOCK_OUT'
                    ? 'bg-[#FEF2ED] text-[#C2410C] border-[#F9CBBA]'
                    : 'bg-[#FEF8ED] text-[#B45309] border-[#FDE68A]';

                const typeLabelText =
                  tx.type === 'STOCK_IN'
                    ? 'Inward'
                    : tx.type === 'STOCK_OUT'
                    ? 'Sale / Out'
                    : 'Adjustment';

                return (
                  <div key={tx.id} className="py-2 flex items-center justify-between text-[11px]">
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`text-[8px] font-bold uppercase px-1 py-0.2 rounded border ${typeBadgeClass}`}
                        >
                          {typeLabelText}
                        </span>
                        <span className="text-[9px] text-[#8E95A2] font-mono">
                          {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-[8px] font-semibold text-[#5F6673] bg-[#F4F4F1] px-1 rounded border border-[#E5E5E0]">
                          {tx.source}
                        </span>
                      </div>
                      {tx.note && (
                        <p className="text-[10px] text-[#5F6673] truncate italic">{tx.note}</p>
                      )}
                    </div>
                    <div
                      className={`font-mono font-bold text-[12px] shrink-0 ${
                        isPositive ? 'text-[#16794A]' : 'text-[#C2410C]'
                      }`}
                    >
                      {deltaVal >= 0 ? '+' : ''}
                      {deltaVal} {tx.normalizedUnit}
                    </div>
                  </div>
                );
              })}

              {transactions.length === 0 && (
                <p className="text-[11px] text-[#8E95A2] italic py-2">
                  No recent activity recorded for this SKU.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Action Footer */}
        <div className="border-t border-[#E5E5E0] bg-[#F4F4F1] px-4 py-3 shrink-0">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#8E95A2] mb-2">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              id={`drawer-stock-in-${product.id}`}
              onClick={() => onStockIn(product)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#16794A] hover:bg-[#126B3F] text-white text-[11px] font-bold rounded transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">move_to_inbox</span>
              Stock In (+)
            </button>
            <button
              id={`drawer-stock-out-${product.id}`}
              onClick={() => onStockOut(product)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white text-[11px] font-bold rounded transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">outbox</span>
              Stock Out (-)
            </button>
            <button
              id={`drawer-audit-${product.id}`}
              onClick={() => onAudit(product)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#FFFFFF] hover:bg-[#F4F4F1] text-[#111318] text-[11px] font-semibold border border-[#E5E5E0] rounded transition-all"
            >
              <span className="material-symbols-outlined text-[14px] text-[#5F6673]">
                fact_check
              </span>
              Audit
            </button>
            <button
              id={`drawer-edit-${product.id}`}
              onClick={() => onEdit(product)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#FFFFFF] hover:bg-[#EEF2FF] text-[#2457FF] text-[11px] font-semibold border border-[#2457FF]/30 rounded transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Edit Product
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

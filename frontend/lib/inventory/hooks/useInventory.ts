'use client';

import { useEffect, useMemo, useState } from 'react';
import { CreateProductDTO, Product, UpdateProductDTO } from '../models/product';
import { InventoryTransaction, TransactionSource } from '../models/transaction';
import { productsApi } from '../../../src/services/api/productsApi';
import { transactionsApi } from '../../../src/services/api/transactionsApi';
import { inventoryApi } from '../../../src/services/api/inventoryApi';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadData = async () => {
    try {
      const [allProds, allTx] = await Promise.all([
        productsApi.getAll(),
        transactionsApi.getAll(),
      ]);
      setProducts(allProds as any);
      setTransactions(allTx as any);
    } catch (e) {
      console.error('Failed to load inventory data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Subscriptions disabled during API migration
  }, []);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    const totalSkus = products.length;
    const lowStockCount = products.filter((p) => p.currentStock <= p.reorderLevel).length;
    const totalValue = products.reduce((acc, p) => acc + p.currentStock * p.price, 0);
    return {
      totalSkus,
      lowStockCount,
      totalValue,
    };
  }, [products]);

  return {
    products,
    filteredProducts,
    transactions,
    categories,
    loading,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    metrics,
    refresh: loadData,

    // Domain Actions
    createProduct: async (dto: CreateProductDTO) => {
      try {
        const product = await productsApi.create(dto);
        await loadData();
        return { success: true, data: product };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },

    updateProduct: async (id: string, dto: UpdateProductDTO) => {
      try {
        const product = await productsApi.update(id, dto);
        await loadData();
        return { success: true, data: product };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },

    stockIn: async (params: {
      productId: string;
      quantity: number;
      unit: string;
      source?: TransactionSource;
      note?: string;
      createdBy?: string;
    }) => {
      try {
        const tx = await inventoryApi.adjustStock({
          product_id: params.productId,
          quantity: params.quantity,
          source: params.source || 'MANUAL'
        });
        await loadData();
        return { success: true, data: tx };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },

    stockOut: async (params: {
      productId: string;
      quantity: number;
      unit: string;
      source?: TransactionSource;
      note?: string;
      createdBy?: string;
    }) => {
      try {
        const tx = await inventoryApi.adjustStock({
          product_id: params.productId,
          quantity: -params.quantity,
          source: params.source || 'MANUAL'
        });
        await loadData();
        return { success: true, data: tx };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },

    adjustStock: async (params: {
      productId: string;
      newPhysicalStock: number;
      unit?: string;
      source?: TransactionSource;
      note?: string;
      createdBy?: string;
    }) => {
      // NOTE: Our simple API right now just takes relative quantity, not absolute.
      // We would ideally have a dedicated endpoint or calculation here.
      // For the sake of the MVP UI, we'll return an error or skip it.
      return { success: false, error: 'Not implemented in new API yet' };
    },
  };
}

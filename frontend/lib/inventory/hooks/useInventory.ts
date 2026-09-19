'use client';

import { useEffect, useMemo, useState } from 'react';
import { CreateProductDTO, Product, UpdateProductDTO } from '../models/product';
import { InventoryTransaction, TransactionSource } from '../models/transaction';
import { productRepository } from '../repositories/productRepository';
import { transactionRepository } from '../repositories/transactionRepository';
import { inventoryService } from '../services/inventoryService';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadData = async () => {
    try {
      const [allProds, allTx] = await Promise.all([
        inventoryService.getAllProducts(),
        inventoryService.getTransactions(undefined, 25),
      ]);
      setProducts(allProds);
      setTransactions(allTx);
    } catch (e) {
      console.error('Failed to load inventory data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to repository updates
    const unsubProducts = productRepository.subscribe(() => {
      inventoryService.getAllProducts().then(setProducts);
    });

    const unsubTransactions = transactionRepository.subscribe(() => {
      inventoryService.getTransactions(undefined, 25).then(setTransactions);
    });

    return () => {
      unsubProducts();
      unsubTransactions();
    };
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
      const res = await inventoryService.createProduct(dto);
      if (res.success) await loadData();
      return res;
    },

    updateProduct: async (id: string, dto: UpdateProductDTO) => {
      const res = await inventoryService.updateProduct(id, dto);
      if (res.success) await loadData();
      return res;
    },

    stockIn: async (params: {
      productId: string;
      quantity: number;
      unit: string;
      source?: TransactionSource;
      note?: string;
      createdBy?: string;
    }) => {
      const res = await inventoryService.stockIn(params);
      if (res.success) await loadData();
      return res;
    },

    stockOut: async (params: {
      productId: string;
      quantity: number;
      unit: string;
      source?: TransactionSource;
      note?: string;
      createdBy?: string;
    }) => {
      const res = await inventoryService.stockOut(params);
      if (res.success) await loadData();
      return res;
    },

    adjustStock: async (params: {
      productId: string;
      newPhysicalStock: number;
      unit?: string;
      source?: TransactionSource;
      note?: string;
      createdBy?: string;
    }) => {
      const res = await inventoryService.adjustStock(params);
      if (res.success) await loadData();
      return res;
    },
  };
}

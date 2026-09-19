import { apiClient } from './client';

export interface TradeUnit {
  id: string;
  business_id: string;
  product_id: string;
  name: string;
  base_unit: string;
  conversion_factor: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const tradeUnitsApi = {
  getAll: async (productId?: string) => {
    const url = productId ? `/trade-units/?product_id=${productId}` : '/trade-units/';
    const response = await apiClient.get<TradeUnit[]>(url);
    return response;
  },

  create: async (data: Omit<TradeUnit, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
    const response = await apiClient.post<TradeUnit>('/trade-units/', data);
    return response;
  },

  update: async (id: string, data: Partial<TradeUnit>) => {
    const response = await apiClient.patch<TradeUnit>(`/trade-units/${id}`, data);
    return response;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/trade-units/${id}`);
    return response;
  },
};

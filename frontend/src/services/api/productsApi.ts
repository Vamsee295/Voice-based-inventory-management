import { apiClient } from './client';
import { Product, CreateProductDTO, UpdateProductDTO } from '../../../lib/inventory/models/product';

export const productsApi = {
  getAll: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get<Product[]>(`/products${query}`);
  },
  
  create: (data: CreateProductDTO) => {
    return apiClient.post<Product>('/products', data);
  },
  
  update: (id: string, data: UpdateProductDTO) => {
    return apiClient.put<Product>(`/products/${id}`, data);
  }
};

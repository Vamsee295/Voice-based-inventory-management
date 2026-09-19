import { apiClient } from './client';

export interface BusinessSettings {
  id: string;
  business_id: string;
  currency: string;
  timezone: string;
  voice_languages: string[];
  voice_confirmation_required: boolean;
  default_base_unit: string;
  low_stock_behavior: string;
  created_at: string;
  updated_at: string;
}

export const settingsApi = {
  getSettings: async () => {
    const response = await apiClient.get<BusinessSettings>('/settings/');
    return response;
  },

  updateSettings: async (data: Partial<BusinessSettings>) => {
    const response = await apiClient.patch<BusinessSettings>('/settings/', data);
    return response;
  },
};

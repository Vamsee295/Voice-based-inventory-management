import { apiClient } from './client';

export interface UserProfile {
  id: string;
  business_id: string;
  email: string;
  role: string;
}

export const authApi = {
  getProfile: async () => {
    const response = await apiClient.get<UserProfile>('/auth/me');
    return response;
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await apiClient.patch<UserProfile>('/auth/me', data);
    return response;
  },

  changePassword: async (data: any) => {
    const response = await apiClient.post('/auth/change-password', data);
    return response;
  },
};

import { apiClient } from './client';

export const driverApi = {
  updateStatus: async (status: 'ONLINE' | 'OFFLINE') => {
    const response = await apiClient.patch('/drivers/status', { status });
    return response.data;
  },
  updateLocation: async (latitude: number, longitude: number, heading?: number) => {
    const response = await apiClient.post('/drivers/location', { latitude, longitude, heading });
    return response.data;
  }
};

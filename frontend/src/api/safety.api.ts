import { apiClient } from './client';

export interface TrustedContactPayload {
  name: string;
  phone: string;
  shareTrips?: boolean;
  notifyOnSOS?: boolean;
}

export const safetyApi = {
  triggerPanic: async (latitude: number, longitude: number, rideId?: string | null, trigger: 'BUTTON' | 'SHAKE' | 'HARDWARE' = 'BUTTON') => {
    const response = await apiClient.post('/safety/panic', { latitude, longitude, rideId, trigger });
    return response.data;
  },
  addTrustedContact: async (data: TrustedContactPayload) => {
    const response = await apiClient.post('/safety/trusted-contacts', data);
    return response.data;
  },
  // Note: Assuming a GET endpoint was added to the backend in Phase F for fetching contacts
  getTrustedContacts: async () => {
    const response = await apiClient.get('/safety/trusted-contacts');
    return response.data;
  }
};

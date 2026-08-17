import { apiClient } from './client';

export interface RequestRidePayload {
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  destinationLat: number;
  destinationLng: number;
  destinationAddress: string;
  paymentMethod: 'CASH' | 'CARD' | 'WALLET';
  requiresAccessibleTier: boolean;
}

export const rideApi = {
  requestRide: async (data: RequestRidePayload) => {
    const response = await apiClient.post('/rides/request', data);
    return response.data;
  },
  acceptRide: async (rideId: string, vehicleId: string) => {
    const response = await apiClient.post('/rides/accept', { rideId, vehicleId });
    return response.data;
  },
  arrive: async (rideId: string) => {
    const response = await apiClient.post(`/rides/${rideId}/arrive`);
    return response.data;
  },
  startTrip: async (rideId: string) => {
    const response = await apiClient.post(`/rides/${rideId}/start`);
    return response.data;
  },
  completeTrip: async (rideId: string) => {
    const response = await apiClient.post(`/rides/${rideId}/complete`);
    return response.data;
  },
  cancelRide: async (rideId: string, reason?: string) => {
    const response = await apiClient.post(`/rides/${rideId}/cancel`, { reason });
    return response.data;
  }
};

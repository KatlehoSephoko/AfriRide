import { apiClient } from './client';

export interface RequestForFriendPayload {
  passengerPhone: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  destinationLat: number;
  destinationLng: number;
  destinationAddress: string;
  requiresAccessibleTier: boolean;
}

export const tripsApi = {
  requestForFriend: async (data: RequestForFriendPayload) => {
    const response = await apiClient.post('/trips/request-for-friend', data);
    return response.data;
  },
  verifyPassenger: async (rideId: string, token: string) => {
    const response = await apiClient.post('/trips/verify-passenger', { rideId, token });
    return response.data;
  }
};

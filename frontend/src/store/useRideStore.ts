import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

const SOCKET_URL = Constants.expoConfig?.extra?.apiUrl?.replace('/api/v1', '') || 'http://localhost:8000';

export type RideStatus = 'REQUESTED' | 'TOKEN_SENT' | 'VERIFIED' | 'DRIVER_ASSIGNED' | 'DRIVER_EN_ROUTE' | 'ARRIVED' | 'IN_TRIP' | 'COMPLETED' | 'CANCELLED';

interface ActiveRide {
  id: string;
  status: RideStatus;
  pickupAddress: string;
  destinationAddress: string;
  requiresAccessibleTier: boolean;
  estimatedFare: string;
  driver?: {
    id: string;
    firstName: string;
    rating: number;
    vehicle: { make: string; model: string; registration: string; color: string; isWAV: boolean };
  };
}

interface RideState {
  socket: Socket | null;
  activeRide: ActiveRide | null;
  driverLocation: { latitude: number; longitude: number; heading?: number } | null;
  connectSocket: () => Promise<void>;
  disconnectSocket: () => void;
  setActiveRide: (ride: ActiveRide | null) => void;
}

export const useRideStore = create<RideState>((set, get) => ({
  socket: null,
  activeRide: null,
  driverLocation: null,

  connectSocket: async () => {
    if (get().socket) return; // Already connected

    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('🟢 Socket connected');
    });

    // Real-time Event Listeners matching Backend Phase E & F
    socket.on('ride.status.updated', (payload: { rideId: string; status: RideStatus }) => {
      const { activeRide } = get();
      if (activeRide && activeRide.id === payload.rideId) {
        set({ activeRide: { ...activeRide, status: payload.status } });
        
        if (payload.status === 'COMPLETED' || payload.status === 'CANCELLED') {
          Alert.alert('Ride Ended', `This ride was ${payload.status.toLowerCase()}.`);
          set({ activeRide: null, driverLocation: null });
        }
      }
    });

    socket.on('driver.location.updated', (payload: { latitude: number; longitude: number; heading: number }) => {
      set({ driverLocation: payload });
    });

    socket.on('ride.driver.assigned', (payload: { ride: ActiveRide }) => {
      // Handles the transition from REQUESTED -> DRIVER_ASSIGNED
      set({ activeRide: payload.ride });
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, activeRide: null, driverLocation: null });
    }
  },

  setActiveRide: (ride) => set({ activeRide: ride }),
}));

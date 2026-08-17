import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { useRideStore } from '../store/useRideStore';
import { PassengerHomeScreen } from '../screens/passenger/PassengerHomeScreen';
import { PassengerTrackingScreen } from '../screens/passenger/PassengerTrackingScreen';
import { DriverHomeScreen } from '../screens/driver/DriverHomeScreen';
import { DriverActiveTripScreen } from '../screens/driver/DriverActiveTripScreen';

const AppStack = createNativeStackNavigator();

export const AppNavigator = () => {
  const role = useAuthStore((state) => state.user?.role);
  const activeRide = useRideStore((state) => state.activeRide);

  // Dynamic Routing based on Active Ride state
  if (role === 'DRIVER') {
    return (
      <AppStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {activeRide ? (
          <AppStack.Screen name="DriverActiveTrip" component={DriverActiveTripScreen} />
        ) : (
          <AppStack.Screen name="DriverHome" component={DriverHomeScreen} />
        )}
      </AppStack.Navigator>
    );
  }

  // Passenger Routing
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {activeRide ? (
        <AppStack.Screen name="PassengerTracking" component={PassengerTrackingScreen} />
      ) : (
        <AppStack.Screen name="PassengerHome" component={PassengerHomeScreen} />
      )}
    </AppStack.Navigator>
  );
};

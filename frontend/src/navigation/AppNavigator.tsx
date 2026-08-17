import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Map, Wallet as WalletIcon, CircleDollarSign } from 'lucide-react-native';

import { useAuthStore } from '../store/useAuthStore';
import { useRideStore } from '../store/useRideStore';

// Passenger Screens
import { PassengerHomeScreen } from '../screens/passenger/PassengerHomeScreen';
import { PassengerTrackingScreen } from '../screens/passenger/PassengerTrackingScreen';
import { PassengerWalletScreen } from '../screens/passenger/PassengerWalletScreen';

//Safety Center
import { SafetyCenterScreen } from '../screens/passenger/SafetyCenterScreen';
import { RequestForFriendScreen } from '../screens/passenger/RequestForFriendScreen';
import { VerifyGuestScreen } from '../screens/passenger/VerifyGuestScreen';

// Driver Screens
import { DriverHomeScreen } from '../screens/driver/DriverHomeScreen';
import { DriverActiveTripScreen } from '../screens/driver/DriverActiveTripScreen';
import { DriverEarningsScreen } from '../screens/driver/DriverEarningsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Passenger Tab Setup
const PassengerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#1C4532',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E5E5E5' },
    }}
  >
    <Tab.Screen 
      name="HomeTab" 
      component={PassengerHomeScreen} 
      options={{ tabBarLabel: 'Ride', tabBarIcon: ({ color }) => <Map color={color} size={24} /> }} 
    />
    <Tab.Screen 
      name="WalletTab" 
      component={PassengerWalletScreen} 
      options={{ tabBarLabel: 'Wallet', tabBarIcon: ({ color }) => <WalletIcon color={color} size={24} /> }} 
    />
  </Tab.Navigator>
);

// Driver Tab Setup
const DriverTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#1C4532',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E5E5E5' },
    }}
  >
    <Tab.Screen 
      name="DriverHomeTab" 
      component={DriverHomeScreen} 
      options={{ tabBarLabel: 'Drive', tabBarIcon: ({ color }) => <Map color={color} size={24} /> }} 
    />
    <Tab.Screen 
      name="EarningsTab" 
      component={DriverEarningsScreen} 
      options={{ tabBarLabel: 'Earnings', tabBarIcon: ({ color }) => <CircleDollarSign color={color} size={24} /> }} 
    />
  </Tab.Navigator>
);

// Root App Navigator (Handles full-screen overrides like active trips)
export const AppNavigator = () => {
  const role = useAuthStore((state) => state.user?.role);
  const activeRide = useRideStore((state) => state.activeRide);


  return (
  <AppStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
    {activeRide ? (
      <AppStack.Screen name="PassengerTracking" component={PassengerTrackingScreen} />
    ) : (
      <>
        <AppStack.Screen name="PassengerHome" component={PassengerHomeScreen} />
        {/* New Routes */}
        <AppStack.Screen name="SafetyCenter" component={SafetyCenterScreen} />
        <AppStack.Screen name="RequestForFriend" component={RequestForFriendScreen} />
        <AppStack.Screen name="VerifyGuest" component={VerifyGuestScreen} />
      </>
    )}
  </AppStack.Navigator>
);
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {/* If a ride is currently active, force the user into the tracking/trip view */}
      {activeRide ? (
        role === 'DRIVER' ? (
          <Stack.Screen name="DriverActiveTrip" component={DriverActiveTripScreen} />
        ) : (
          <Stack.Screen name="PassengerTracking" component={PassengerTrackingScreen} />
        )
      ) : (
        /* Otherwise, show standard tab navigation */
        role === 'DRIVER' ? (
          <Stack.Screen name="DriverRoot" component={DriverTabs} />
        ) : (
          <Stack.Screen name="PassengerRoot" component={PassengerTabs} />
        )
      )}
    </Stack.Navigator>
  );
};

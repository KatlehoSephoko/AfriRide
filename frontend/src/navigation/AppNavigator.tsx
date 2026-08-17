import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { PassengerHomeScreen } from '../screens/passenger/PassengerHomeScreen';
import { DriverHomeScreen } from '../screens/driver/DriverHomeScreen';

const AppStack = createNativeStackNavigator();

export const AppNavigator = () => {
  const role = useAuthStore((state) => state.user?.role);

  return (
    <AppStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {role === 'DRIVER' ? (
        <AppStack.Screen name="DriverHome" component={DriverHomeScreen} />
      ) : (
        <AppStack.Screen name="PassengerHome" component={PassengerHomeScreen} />
      )}
    </AppStack.Navigator>
  );
};

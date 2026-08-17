import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';

// Temporary placeholder screens for Phase A
const PassengerHome = () => (
  <View className="flex-1 bg-brand-white items-center justify-center">
    <Text className="text-brand-green font-bold text-xl">Where to?</Text>
  </View>
);

const DriverHome = () => (
  <View className="flex-1 bg-brand-white items-center justify-center">
    <Text className="text-brand-green font-bold text-xl">You are offline</Text>
  </View>
);

const AppStack = createNativeStackNavigator();

export const AppNavigator = () => {
  const role = useAuthStore((state) => state.user?.role);

  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      {role === 'DRIVER' ? (
        <AppStack.Screen name="DriverHome" component={DriverHome} />
      ) : (
        <AppStack.Screen name="PassengerHome" component={PassengerHome} />
      )}
    </AppStack.Navigator>
  );
};

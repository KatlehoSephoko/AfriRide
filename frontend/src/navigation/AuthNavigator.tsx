import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

// Temporary placeholder screens for Phase A
const LoginScreen = () => (
  <View className="flex-1 bg-brand-cream items-center justify-center">
    <Text className="text-brand-green font-bold text-2xl">AfriRide</Text>
    <Text className="text-brand-neutral mt-2">Login Screen Placeholder</Text>
  </View>
);

const AuthStack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
};

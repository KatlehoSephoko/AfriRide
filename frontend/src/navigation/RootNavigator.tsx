import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { useAuthStore } from '../store/useAuthStore';
import { useRideStore } from '../store/useRideStore';

export const RootNavigator = () => {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();
  const { connectSocket, disconnectSocket } = useRideStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Connect sockets when authenticated, clean up on logout
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, connectSocket, disconnectSocket]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-brand-cream items-center justify-center">
        <ActivityIndicator size="large" color="#1C4532" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* 
        Using 'dark' ensures the status bar text is visible 
        against our soft cream/white backgrounds 
      */}
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

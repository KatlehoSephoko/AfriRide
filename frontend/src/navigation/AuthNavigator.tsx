import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { AccessibilityOnboardingScreen } from '../screens/auth/AccessibilityOnboardingScreen';

const AuthStack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <AuthStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="AccessibilityOnboarding" component={AccessibilityOnboardingScreen} />
    </AuthStack.Navigator>
  );
};

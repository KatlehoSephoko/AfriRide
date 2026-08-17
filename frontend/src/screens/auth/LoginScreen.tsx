import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/auth.api';

export const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter your phone number and password.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authApi.login({ phone, password });
      await login(response.data.user, response.data.accessToken, response.data.refreshToken);
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-cream">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
          <View className="mb-10">
            <Text className="text-4xl font-bold text-brand-green mb-2" accessibilityRole="header">Welcome Back</Text>
            <Text className="text-brand-neutral text-lg">Sign in to your AfriRide account.</Text>
          </View>

          <Input 
            label="Phone Number" 
            keyboardType="phone-pad" 
            value={phone} 
            onChangeText={setPhone} 
            placeholder="e.g. 0821234567"
          />
          <Input 
            label="Password" 
            secureTextEntry 
            value={password} 
            onChangeText={setPassword} 
            placeholder="Enter your password"
          />

          <View className="mt-6">
            <Button title="Login" onPress={handleLogin} isLoading={isLoading} />
            <Button 
              title="Create an Account" 
              variant="ghost" 
              className="mt-4" 
              onPress={() => navigation.navigate('Register')} 
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

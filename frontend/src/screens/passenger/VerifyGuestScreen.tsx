import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { tripsApi } from '../../api/trips.api';

export const VerifyGuestScreen = ({ route, navigation }: any) => {
  // In production, rideId would be passed via deep link parameters
  const rideId = route.params?.rideId || 'mock-ride-id'; 
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (token.length < 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code sent to your SMS.');
      return;
    }

    setIsLoading(true);
    try {
      await tripsApi.verifyPassenger(rideId, token);
      Alert.alert('Verified!', 'Your driver is now being matched.');
      // Navigate to a locked-down guest tracking view or back to home
      navigation.goBack(); 
    } catch (error: any) {
      // Handles the BullMQ 180-second timeout race condition gracefully
      Alert.alert('Verification Failed', error.response?.data?.message || 'Code expired or invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-cream">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center p-6">
        <View className="bg-brand-white p-8 rounded-3xl shadow-lg border border-brand-lightNeutral">
          <Text className="text-2xl font-bold text-brand-green mb-2 text-center">Verify Your Ride</Text>
          <Text className="text-brand-neutral text-center mb-8">
            Your friend requested an AfriRide for you. Enter the 6-digit code from your SMS to confirm before it expires.
          </Text>

          <Input 
            label="Verification Code" 
            placeholder="e.g. 123456" 
            keyboardType="number-pad" 
            maxLength={6}
            value={token} 
            onChangeText={setToken} 
            textAlign="center"
          />

          <View className="mt-4">
            <Button title="Verify Now" onPress={handleVerify} isLoading={isLoading} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

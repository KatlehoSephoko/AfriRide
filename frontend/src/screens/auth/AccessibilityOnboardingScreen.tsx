import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/auth.api';

export const AccessibilityOnboardingScreen = ({ route }: any) => {
  const { registerData } = route.params;
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  
  // Accessibility State
  const [requiresWAV, setRequiresWAV] = useState(false);
  const [prefersTextOnly, setPrefersTextOnly] = useState(false);
  const [prefersVoice, setPrefersVoice] = useState(false);

  const handleCompleteRegistration = async () => {
    setIsLoading(true);
    try {
      const finalPayload = {
        ...registerData,
        accessibility: {
          requiresAccessibleTier: requiresWAV,
          disabilityType: requiresWAV ? 'MOBILITY' : 'NONE',
          // In production, sync text/voice preferences to PassengerProfile here
        }
      };

      const response = await authApi.registerPassenger(finalPayload);
      // Automatically log the user in
      await login(response.data.user, response.data.accessToken, response.data.refreshToken);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-cream">
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
        <Text className="text-3xl font-bold text-brand-green mb-2" accessibilityRole="header">Accessibility Hub</Text>
        <Text className="text-brand-neutral mb-8">AfriRide is built for everyone. Let us know how we can make your rides better. (Optional)</Text>

        <View className="bg-brand-white rounded-xl p-4 mb-4 border border-brand-lightNeutral">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1 mr-4">
              <Text className="text-brand-green font-bold text-lg">Wheelchair Accessible Vehicle (WAV)</Text>
              <Text className="text-brand-neutral text-sm mt-1">Match exclusively with certified drivers operating ramp or lift-equipped vehicles. Triggers the 12-minute wait-time empathy rule.</Text>
            </View>
            <Switch 
              value={requiresWAV} 
              onValueChange={setRequiresWAV}
              trackColor={{ false: '#E5E5E5', true: '#1C4532' }}
              accessibilityLabel="Require Wheelchair Accessible Vehicle"
            />
          </View>
        </View>

        <View className="bg-brand-white rounded-xl p-4 mb-4 border border-brand-lightNeutral">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1 mr-4">
              <Text className="text-brand-green font-bold text-lg">Text-Only Communication</Text>
              <Text className="text-brand-neutral text-sm mt-1">Disables phone calls from drivers and enforces in-app text chat. Ideal for deaf or hard-of-hearing passengers.</Text>
            </View>
            <Switch 
              value={prefersTextOnly} 
              onValueChange={(val) => { setPrefersTextOnly(val); if(val) setPrefersVoice(false); }}
              trackColor={{ false: '#E5E5E5', true: '#1C4532' }}
              accessibilityLabel="Require Text-Only Communication"
            />
          </View>
        </View>

        <View className="bg-brand-white rounded-xl p-4 mb-8 border border-brand-lightNeutral">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1 mr-4">
              <Text className="text-brand-green font-bold text-lg">Voice Prompts & TTS</Text>
              <Text className="text-brand-neutral text-sm mt-1">Read ride updates, driver arrival, and AI responses aloud automatically.</Text>
            </View>
            <Switch 
              value={prefersVoice} 
              onValueChange={(val) => { setPrefersVoice(val); if(val) setPrefersTextOnly(false); }}
              trackColor={{ false: '#E5E5E5', true: '#1C4532' }}
              accessibilityLabel="Enable Voice Prompts"
            />
          </View>
        </View>

        <View className="mt-auto">
          <Button title="Complete Registration" onPress={handleCompleteRegistration} isLoading={isLoading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

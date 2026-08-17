import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { MessageSquare, MapPin } from 'lucide-react-native';
import { AppMap } from '../../components/map/MapView';
import { AIAssistantModal } from '../../components/ai/AIAssistantModal';

export const PassengerHomeScreen = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'AfriRide needs location access to find drivers.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  const handleAIIntent = (intent: string, entities: any) => {
    if (intent === 'BOOK_RIDE' && entities.destination) {
      setDestination(entities.destination);
      // In Phase D, this will transition to the Ride Confirmation / Pricing Screen
      Alert.alert('Route Planned', `AI has set your destination to: ${entities.destination}`);
    }
  };

  return (
    <View className="flex-1 bg-brand-cream">
      {/* Map Background */}
      <AppMap userLocation={location} />

      {/* SafeArea overlay for UI */}
      <SafeAreaView className="flex-1 justify-between pointer-events-box-none">
        
        {/* Top Bar */}
        <View className="p-4 items-center mt-2 pointer-events-box-none">
          <View className="bg-brand-white px-6 py-2 rounded-full shadow-sm border border-brand-lightNeutral">
            <Text className="text-brand-green font-bold text-lg">AfriRide</Text>
          </View>
        </View>

        {/* Bottom Booking UI */}
        <View className="p-4 mb-6">
          <View className="bg-brand-white rounded-3xl p-6 shadow-lg border border-brand-lightNeutral">
            <Text className="text-xl font-bold text-brand-neutral mb-4">Where to?</Text>
            
            {/* Standard Input */}
            <TouchableOpacity 
              className="bg-brand-cream flex-row items-center p-4 rounded-xl border border-brand-lightNeutral mb-4"
              accessibilityLabel="Enter destination manually"
              accessibilityRole="button"
            >
              <MapPin color="#1C4532" size={20} className="mr-3" />
              <Text className="text-brand-neutral text-lg">{destination || "Search destination..."}</Text>
            </TouchableOpacity>

            <View className="flex-row items-center my-2">
              <View className="flex-1 h-[1px] bg-brand-lightNeutral" />
              <Text className="mx-4 text-brand-neutral text-xs font-semibold">OR</Text>
              <View className="flex-1 h-[1px] bg-brand-lightNeutral" />
            </View>

            {/* AI Assistant Trigger */}
            <TouchableOpacity 
              className="bg-brand-green flex-row justify-center items-center p-4 rounded-xl mt-2"
              onPress={() => setAiModalVisible(true)}
              accessibilityLabel="Open AI Assistant to book with your voice or text"
              accessibilityRole="button"
            >
              <MessageSquare color="#FFFFFF" size={20} className="mr-2" />
              <Text className="text-brand-white font-bold text-lg">Ask AI to Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <AIAssistantModal 
        visible={aiModalVisible} 
        onClose={() => setAiModalVisible(false)} 
        onIntentReceived={handleAIIntent} 
      />
    </View>
  );
};

import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { AppMap } from '../../components/map/MapView';
import { driverApi } from '../../api/driver.api';

export const DriverHomeScreen = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  const toggleOnlineStatus = async (value: boolean) => {
    try {
      // Optimistic update
      setIsOnline(value);
      const newStatus = value ? 'ONLINE' : 'OFFLINE';
      await driverApi.updateStatus(newStatus);
      
      // If going online, push current location immediately to PostGIS
      if (value && location) {
        await driverApi.updateLocation(location.latitude, location.longitude);
      }
    } catch (error: any) {
      // Revert if failed (e.g. documents not verified)
      setIsOnline(!value);
      Alert.alert('Status Update Failed', error.response?.data?.message || 'Could not go online.');
    }
  };

  return (
    <View className="flex-1 bg-brand-cream">
      <AppMap userLocation={location} />

      <SafeAreaView className="flex-1 justify-between pointer-events-box-none">
        
        {/* Status Header */}
        <View className="p-4 items-center mt-2 pointer-events-box-none">
          <View className={`px-6 py-3 rounded-full shadow-sm flex-row items-center ${isOnline ? 'bg-brand-green' : 'bg-brand-neutral'}`}>
            <View className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
            <Text className="text-brand-white font-bold text-lg">
              {isOnline ? 'You\'re Online' : 'You\'re Offline'}
            </Text>
          </View>
        </View>

        {/* Bottom Control Panel */}
        <View className="p-4 mb-6">
          <View className="bg-brand-white rounded-3xl p-6 shadow-lg border border-brand-lightNeutral flex-row justify-between items-center">
            <View>
              <Text className="text-xl font-bold text-brand-neutral">
                {isOnline ? 'Finding Rides...' : 'Go Online to Earn'}
              </Text>
              <Text className="text-brand-neutral text-sm mt-1">
                {isOnline ? 'Stay in high demand areas.' : 'Your vehicle is verified.'}
              </Text>
            </View>
            <Switch 
              value={isOnline} 
              onValueChange={toggleOnlineStatus}
              trackColor={{ false: '#E5E5E5', true: '#1C4532' }}
              style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
              accessibilityLabel="Toggle Online Status"
            />
          </View>
        </View>

      </SafeAreaView>
    </View>
  );
};

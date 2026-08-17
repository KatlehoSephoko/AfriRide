import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppMap } from '../../components/map/MapView';
import { useRideStore } from '../../store/useRideStore';
import { rideApi } from '../../api/ride.api';
import { Button } from '../../components/ui/Button';

export const DriverActiveTripScreen = () => {
  const { activeRide, setActiveRide } = useRideStore();
  const [isLoading, setIsLoading] = useState(false);

  if (!activeRide) return null;

  const handleStateTransition = async () => {
    setIsLoading(true);
    try {
      if (activeRide.status === 'DRIVER_ASSIGNED' || activeRide.status === 'DRIVER_EN_ROUTE') {
        await rideApi.arrive(activeRide.id);
        setActiveRide({ ...activeRide, status: 'ARRIVED' });
      } else if (activeRide.status === 'ARRIVED') {
        await rideApi.startTrip(activeRide.id);
        setActiveRide({ ...activeRide, status: 'IN_TRIP' });
      } else if (activeRide.status === 'IN_TRIP') {
        await rideApi.completeTrip(activeRide.id);
        setActiveRide(null); // Clears the active ride, returning driver to Home
        Alert.alert('Trip Completed', `Earnings added to your wallet.`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update trip status.');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonTitle = () => {
    switch (activeRide.status) {
      case 'DRIVER_ASSIGNED':
      case 'DRIVER_EN_ROUTE': return 'Tap when Arrived';
      case 'ARRIVED': return 'Start Trip';
      case 'IN_TRIP': return 'Complete Trip';
      default: return 'Loading...';
    }
  };

  return (
    <View className="flex-1 bg-brand-cream">
      {/* Map showing route (Route polyline logic implemented in Maps Provider) */}
      <AppMap userLocation={null} />

      <SafeAreaView className="flex-1 justify-end pointer-events-box-none">
        
        <View className="bg-brand-white rounded-t-3xl p-6 shadow-lg border-t border-brand-lightNeutral">
          <Text className="text-xl font-bold text-brand-green mb-4">
            {activeRide.status === 'IN_TRIP' ? 'Drop-off Location' : 'Pickup Location'}
          </Text>
          
          <View className="bg-brand-cream p-4 rounded-xl border border-brand-lightNeutral mb-6">
            <Text className="text-brand-neutral font-bold text-lg mb-1">
              {activeRide.status === 'IN_TRIP' ? activeRide.destinationAddress : activeRide.pickupAddress}
            </Text>
            {activeRide.requiresAccessibleTier && (
              <Text className="text-brand-green text-sm font-bold mt-2">
                ♿ Passenger requires WAV assistance. Grace period is 12 minutes.
              </Text>
            )}
          </View>

          <Button 
            title={getButtonTitle()} 
            onPress={handleStateTransition} 
            isLoading={isLoading} 
          />
        </View>

      </SafeAreaView>
    </View>
  );
};

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldAlert, XCircle, MessageSquare } from 'lucide-react-native';
import { AppMap } from '../../components/map/MapView';
import { useRideStore } from '../../store/useRideStore';
import { rideApi } from '../../api/ride.api';
import { Button } from '../../components/ui/Button';

export const PassengerTrackingScreen = () => {
  const { activeRide, driverLocation, setActiveRide } = useRideStore();

  const handleCancel = async () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel this ride?', [
      { text: 'No', style: 'cancel' },
      { 
        text: 'Yes, Cancel', 
        style: 'destructive',
        onPress: async () => {
          try {
            if (activeRide) {
              await rideApi.cancelRide(activeRide.id, 'PASSENGER_REQUESTED');
              setActiveRide(null);
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to cancel ride.');
          }
        }
      }
    ]);
  };

  const handleSOS = () => {
    // In Phase F, this hits the /safety/panic endpoint
    Alert.alert('SOS Triggered', 'Emergency services and your trusted contacts have been notified.');
  };

  if (!activeRide) return null;

  const isDriverAssigned = activeRide.driver !== undefined;

  return (
    <View className="flex-1 bg-brand-cream">
      {/* Map with passenger location AND real-time driver location */}
      <AppMap 
        userLocation={null} // Default to region centering in production
        drivers={driverLocation && isDriverAssigned ? [{ id: activeRide.driver!.id, ...driverLocation }] : []} 
      />

      <SafeAreaView className="flex-1 justify-between pointer-events-box-none">
        
        {/* Top Safety Bar */}
        <View className="p-4 items-end pointer-events-box-none">
          <TouchableOpacity 
            className="bg-brand-danger p-3 rounded-full shadow-lg flex-row items-center"
            onPress={handleSOS}
            accessibilityLabel="Trigger Emergency SOS"
            accessibilityRole="button"
          >
            <ShieldAlert color="#FFFFFF" size={24} />
            <Text className="text-brand-white font-bold ml-2">SOS</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Ride Status Sheet */}
        <View className="bg-brand-white rounded-t-3xl p-6 shadow-lg border-t border-brand-lightNeutral mt-auto">
          <View className="items-center mb-4">
            <View className="w-12 h-1 bg-brand-lightNeutral rounded-full" />
          </View>

          <Text className="text-xl font-bold text-brand-green mb-1">
            {activeRide.status === 'REQUESTED' ? 'Finding your driver...' : 
             activeRide.status === 'DRIVER_ASSIGNED' ? 'Driver is on the way' :
             activeRide.status === 'ARRIVED' ? 'Driver has arrived' : 'In Trip'}
          </Text>
          <Text className="text-brand-neutral text-sm mb-4">
            Destination: {activeRide.destinationAddress}
          </Text>

          {isDriverAssigned && activeRide.driver && (
            <View className="bg-brand-cream p-4 rounded-xl border border-brand-lightNeutral flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-brand-neutral font-bold text-lg">{activeRide.driver.firstName}</Text>
                <Text className="text-brand-neutral text-sm">
                  {activeRide.driver.vehicle.color} {activeRide.driver.vehicle.make} {activeRide.driver.vehicle.model}
                </Text>
                <Text className="text-brand-green font-bold text-lg mt-1">{activeRide.driver.vehicle.registration}</Text>
              </View>
              {activeRide.driver.vehicle.isWAV && (
                <View className="bg-brand-green px-2 py-1 rounded">
                  <Text className="text-brand-white text-xs font-bold">WAV</Text>
                </View>
              )}
            </View>
          )}

          <View className="flex-row justify-between mt-2">
            <TouchableOpacity 
              className="bg-brand-cream border border-brand-lightNeutral p-4 rounded-xl flex-1 mr-2 flex-row justify-center items-center"
              accessibilityLabel="Cancel Ride"
              onPress={handleCancel}
            >
              <XCircle color="#D32F2F" size={20} className="mr-2" />
              <Text className="text-brand-danger font-bold text-lg">Cancel</Text>
            </TouchableOpacity>

            {isDriverAssigned && (
              <TouchableOpacity 
                className="bg-brand-green p-4 rounded-xl flex-1 ml-2 flex-row justify-center items-center"
                accessibilityLabel="Chat with driver"
              >
                <MessageSquare color="#FFFFFF" size={20} className="mr-2" />
                <Text className="text-brand-white font-bold text-lg">Chat</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

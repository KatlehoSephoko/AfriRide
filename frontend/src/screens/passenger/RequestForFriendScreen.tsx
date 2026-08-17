import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { tripsApi } from '../../api/trips.api';

export const RequestForFriendScreen = ({ navigation }: any) => {
  const [guestPhone, setGuestPhone] = useState('');
  const [destination, setDestination] = useState(''); // Simplified for UI mockup
  const [requiresWAV, setRequiresWAV] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequest = async () => {
    if (!guestPhone || !destination) {
      Alert.alert('Missing Fields', 'Please enter your friend\'s phone number and destination.');
      return;
    }

    setIsLoading(true);
    try {
      // In production, destination address would be geocoded into Lat/Lng
      await tripsApi.requestForFriend({
        passengerPhone: guestPhone,
        pickupLat: -25.7479, // Pretoria Mock
        pickupLng: 28.2293,
        pickupAddress: 'Current Location',
        destinationLat: -25.7500,
        destinationLng: 28.2300,
        destinationAddress: destination,
        requiresAccessibleTier: requiresWAV
      });
      
      Alert.alert(
        'Request Sent', 
        `An SMS with a 6-digit code has been sent to ${guestPhone}. They have 3 minutes to verify before the ride is cancelled.`
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to request ride for friend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-cream">
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
        <Text className="text-3xl font-bold text-brand-green mb-2" accessibilityRole="header">Book for a Friend</Text>
        <Text className="text-brand-neutral mb-8">
          Order a ride for someone else. They will receive an SMS to verify the trip for their safety.
        </Text>

        <Input 
          label="Friend's Phone Number" 
          placeholder="082 123 4567" 
          keyboardType="phone-pad" 
          value={guestPhone} 
          onChangeText={setGuestPhone} 
        />
        
        <Input 
          label="Destination" 
          placeholder="Where are they going?" 
          value={destination} 
          onChangeText={setDestination} 
        />

        <View className="bg-brand-white rounded-xl p-4 my-4 border border-brand-lightNeutral flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-brand-green font-bold text-lg">Require WAV?</Text>
            <Text className="text-brand-neutral text-sm mt-1">Does your friend require a Wheelchair Accessible Vehicle?</Text>
          </View>
          <Switch 
            value={requiresWAV} 
            onValueChange={setRequiresWAV}
            trackColor={{ false: '#E5E5E5', true: '#1C4532' }}
          />
        </View>

        <View className="mt-auto pt-8">
          <Button title="Send Verification SMS" onPress={handleRequest} isLoading={isLoading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

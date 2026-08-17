import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldAlert, UserPlus, Phone } from 'lucide-react-native';
import * as Location from 'expo-location';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { safetyApi } from '../../api/safety.api';
import { useRideStore } from '../../store/useRideStore';

export const SafetyCenterScreen = ({ navigation }: any) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const activeRide = useRideStore((state) => state.activeRide);

  const handleAddContact = async () => {
    if (!newContactName || !newContactPhone) {
      Alert.alert('Missing Fields', 'Please provide a name and phone number.');
      return;
    }
    
    setIsLoading(true);
    try {
      await safetyApi.addTrustedContact({ name: newContactName, phone: newContactPhone });
      Alert.alert('Success', 'Trusted contact added.');
      setNewContactName('');
      setNewContactPhone('');
      // In production, refresh contact list here
      setContacts(prev => [...prev, { id: Date.now().toString(), name: newContactName, phone: newContactPhone }]);
    } catch (error) {
      Alert.alert('Error', 'Could not add trusted contact.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSOS = async () => {
    Alert.alert(
      'EMERGENCY SOS',
      'This will dispatch armed response and notify your trusted contacts. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'DISPATCH SOS', 
          style: 'destructive',
          onPress: async () => {
            try {
              let loc = await Location.getCurrentPositionAsync({});
              await safetyApi.triggerPanic(loc.coords.latitude, loc.coords.longitude, activeRide?.id, 'BUTTON');
              Alert.alert('SOS Dispatched', 'Help is on the way. Your contacts have been notified.');
            } catch (error) {
              Alert.alert('SOS Failed', 'Could not connect to emergency services. Please dial 10111 directly.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-cream">
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
        <Text className="text-3xl font-bold text-brand-green mb-6" accessibilityRole="header">Safety Center</Text>

        {/* SOS Button */}
        <TouchableOpacity 
          className="bg-brand-danger rounded-3xl p-8 items-center justify-center mb-8 shadow-lg"
          onPress={handleSOS}
          accessibilityLabel="Emergency SOS Button. Double tap to dispatch armed response."
          accessibilityRole="button"
        >
          <ShieldAlert color="#FFFFFF" size={48} className="mb-2" />
          <Text className="text-brand-white font-bold text-2xl tracking-wider">TAP FOR SOS</Text>
          <Text className="text-brand-white mt-2 text-center opacity-90">
            Dispatches emergency services to your live location.
          </Text>
        </TouchableOpacity>

        {/* Trusted Contacts */}
        <View className="bg-brand-white rounded-2xl p-6 border border-brand-lightNeutral">
          <View className="flex-row items-center mb-4">
            <UserPlus color="#1C4532" size={24} className="mr-2" />
            <Text className="text-xl font-bold text-brand-neutral">Trusted Contacts</Text>
          </View>
          <Text className="text-brand-neutral text-sm mb-4">
            These contacts will receive an SMS automatically if you trigger an SOS.
          </Text>

          <Input label="Name" placeholder="e.g. Mom" value={newContactName} onChangeText={setNewContactName} />
          <Input label="Phone Number" placeholder="e.g. 082 555 1234" keyboardType="phone-pad" value={newContactPhone} onChangeText={setNewContactPhone} />
          
          <Button title="Add Contact" onPress={handleAddContact} isLoading={isLoading} variant="secondary" />

          {/* Contact List */}
          <View className="mt-6">
            {contacts.map((contact) => (
              <View key={contact.id} className="flex-row items-center justify-between p-4 bg-brand-cream rounded-xl mb-2 border border-brand-lightNeutral">
                <View>
                  <Text className="font-bold text-brand-neutral">{contact.name}</Text>
                  <Text className="text-brand-neutral mt-1 text-sm">{contact.phone}</Text>
                </View>
                <Phone color="#1C4532" size={20} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

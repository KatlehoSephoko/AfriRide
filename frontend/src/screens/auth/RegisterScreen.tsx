import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const RegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
  });
  const [popiaConsent, setPopiaConsent] = useState(false);

  const handleNext = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (!popiaConsent) {
      Alert.alert('Consent Required', 'You must agree to the POPIA data processing terms to use AfriRide.');
      return;
    }
    
    // Pass partial data to Step 2
    navigation.navigate('AccessibilityOnboarding', { 
      registerData: {
        ...formData,
        termsAccepted: true,
        privacyPolicyAccepted: true,
        popiaConsent,
      }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-cream">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
          <Text className="text-3xl font-bold text-brand-green mb-6" accessibilityRole="header">Create Account</Text>

          <Input label="First Name" value={formData.firstName} onChangeText={(t) => setFormData({...formData, firstName: t})} />
          <Input label="Last Name" value={formData.lastName} onChangeText={(t) => setFormData({...formData, lastName: t})} />
          <Input label="Phone Number" keyboardType="phone-pad" value={formData.phone} onChangeText={(t) => setFormData({...formData, phone: t})} />
          <Input label="Password" secureTextEntry value={formData.password} onChangeText={(t) => setFormData({...formData, password: t})} />

          {/* POPIA Compliance Toggle */}
          <View className="flex-row items-center justify-between bg-brand-white p-4 rounded-xl mt-4 border border-brand-lightNeutral">
            <View className="flex-1 mr-4">
              <Text className="text-brand-neutral font-semibold">Data Privacy (POPIA)</Text>
              <Text className="text-brand-neutral text-xs mt-1">I consent to AfriRide securely processing my data for ride matching and safety.</Text>
            </View>
            <Switch 
              value={popiaConsent} 
              onValueChange={setPopiaConsent}
              trackColor={{ false: '#E5E5E5', true: '#1C4532' }}
              accessible={true}
              accessibilityLabel="POPIA Consent Toggle"
              accessibilityRole="switch"
            />
          </View>

          <View className="mt-8">
            <Button title="Continue" onPress={handleNext} />
            <Button title="Back to Login" variant="ghost" className="mt-2" onPress={() => navigation.goBack()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

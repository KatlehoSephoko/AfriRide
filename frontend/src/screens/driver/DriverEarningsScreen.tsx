import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Clock, FileText } from 'lucide-react-native';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Button } from '../../components/ui/Button';

export const DriverEarningsScreen = () => {
  const { balance, isLoading, fetchBalance } = useFinanceStore();

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleCashOut = () => {
    // In production, this initiates a payout to their registered bank account
    Alert.alert('Payout Requested', 'Your funds will reflect in your registered bank account within 24-48 hours.');
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-cream">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-3xl font-bold text-brand-green mb-6" accessibilityRole="header">Earnings</Text>

        {/* Core Earnings Card */}
        <View className="bg-brand-green p-6 rounded-3xl shadow-lg mb-8">
          <Text className="text-brand-cream font-semibold mb-2">Available to Cash Out</Text>
          <Text className="text-4xl font-bold text-brand-white mb-6">
            R {isLoading ? '...' : balance.toFixed(2)}
          </Text>
          
          <Button 
            title="Cash Out Now" 
            onPress={handleCashOut} 
            variant="secondary"
            disabled={balance < 50} // Minimum payout threshold
          />
          {balance < 50 && (
            <Text className="text-brand-cream text-xs text-center mt-2">Minimum cash out is R50.00</Text>
          )}
        </View>

        <Text className="text-xl font-bold text-brand-neutral mb-4">Activity Breakdown</Text>
        
        <View className="bg-brand-white p-4 rounded-xl border border-brand-lightNeutral mb-3 flex-row items-center">
          <View className="bg-brand-cream p-3 rounded-full mr-4">
            <TrendingUp color="#1C4532" size={24} />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-brand-neutral text-lg">Platform Fee</Text>
            <Text className="text-brand-neutral text-sm">Transparent 15% commission</Text>
          </View>
        </View>

        <View className="bg-brand-white p-4 rounded-xl border border-brand-lightNeutral mb-3 flex-row items-center">
          <View className="bg-brand-cream p-3 rounded-full mr-4">
            <Clock color="#1C4532" size={24} />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-brand-neutral text-lg">Instant Payouts</Text>
            <Text className="text-brand-neutral text-sm">Processed automatically daily</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

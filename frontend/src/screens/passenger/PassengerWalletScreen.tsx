import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, Wallet, Banknote, PlusCircle } from 'lucide-react-native';
import { useFinanceStore } from '../../store/useFinanceStore';
import { financeApi } from '../../api/finance.api';
import { Button } from '../../components/ui/Button';

export const PassengerWalletScreen = () => {
  const { balance, isLoading, fetchBalance, paymentMethod, setPaymentMethod } = useFinanceStore();
  const [isToppingUp, setIsToppingUp] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleTopUp = async () => {
    // In production, this opens a Paystack/Peach Payments modal.
    // We strictly use our backend abstraction for the MVP.
    Alert.prompt(
      'Add Funds (ZAR)',
      'Enter amount to add to your AfriRide wallet:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Top Up', 
          onPress: async (amountStr) => {
            const amount = parseFloat(amountStr || '0');
            if (amount < 10 || amount > 10000) {
              Alert.alert('Invalid Amount', 'Please enter an amount between R10 and R10,000.');
              return;
            }
            
            setIsToppingUp(true);
            try {
              await financeApi.addFunds(amount);
              await fetchBalance();
              Alert.alert('Success', `R${amount.toFixed(2)} added securely to your wallet.`);
            } catch (error) {
              Alert.alert('Payment Failed', 'Could not process the top-up at this time.');
            } finally {
              setIsToppingUp(false);
            }
          }
        }
      ],
      'plain-text',
      '100'
    );
  };

  const PaymentOption = ({ method, title, icon: Icon, desc }: any) => (
    <TouchableOpacity 
      className={`flex-row items-center p-4 rounded-xl border mb-3 ${paymentMethod === method ? 'bg-brand-green border-brand-green' : 'bg-brand-white border-brand-lightNeutral'}`}
      onPress={() => setPaymentMethod(method)}
      accessibilityRole="radio"
      accessibilityState={{ checked: paymentMethod === method }}
      accessibilityLabel={`Select ${title} as payment method`}
    >
      <Icon color={paymentMethod === method ? '#FFFFFF' : '#1C4532'} size={24} className="mr-4" />
      <View className="flex-1">
        <Text className={`font-bold text-lg ${paymentMethod === method ? 'text-brand-white' : 'text-brand-neutral'}`}>{title}</Text>
        <Text className={`text-sm ${paymentMethod === method ? 'text-brand-cream' : 'text-brand-neutral'}`}>{desc}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-brand-cream">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-3xl font-bold text-brand-green mb-6" accessibilityRole="header">Wallet</Text>

        {/* Balance Card */}
        <View className="bg-brand-white p-6 rounded-3xl shadow-sm border border-brand-lightNeutral mb-8">
          <Text className="text-brand-neutral font-semibold mb-2">Available Balance</Text>
          <Text className="text-4xl font-bold text-brand-green mb-6">
            R {isLoading ? '...' : balance.toFixed(2)}
          </Text>
          
          <Button 
            title="Add Funds" 
            onPress={handleTopUp} 
            isLoading={isToppingUp}
            variant="secondary"
          />
        </View>

        <Text className="text-xl font-bold text-brand-neutral mb-4">Payment Methods</Text>
        
        <PaymentOption method="WALLET" title="AfriRide Wallet" desc="Pay instantly from your balance" icon={Wallet} />
        <PaymentOption method="CASH" title="Cash" desc="Pay the driver directly" icon={Banknote} />
        <PaymentOption method="CARD" title="Credit / Debit Card" desc="Secure in-app payment" icon={CreditCard} />
        
      </ScrollView>
    </SafeAreaView>
  );
};

import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { X, Send } from 'lucide-react-native';
import { Input } from '../ui/Input';
import { aiApi } from '../../api/ai.api';

interface AIAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  onIntentReceived: (intent: string, entities: any) => void;
}

interface ChatMessage {
  id: string;
  role: 'USER' | 'AI';
  text: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ visible, onClose, onIntentReceived }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'AI', text: 'Sawubona! How can I help you with your ride today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'USER', text: userMessage }]);
    setIsTyping(true);

    try {
      const response = await aiApi.sendMessage(userMessage);
      const aiData = response.data;

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'AI', text: aiData.replyText }]);

      // If the AI successfully parsed a booking intent, pass it up to the Home Screen
      if (aiData.intent === 'BOOK_RIDE' && aiData.entities?.destination) {
        setTimeout(() => {
          onIntentReceived(aiData.intent, aiData.entities);
          onClose();
        }, 2000);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'AI', text: "I'm having trouble connecting right now. Please try the standard booking menu." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/50">
        <View className="bg-brand-cream rounded-t-3xl h-[80%] flex-col">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-brand-lightNeutral">
            <Text className="text-xl font-bold text-brand-green">AfriRide AI</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close AI Assistant" accessibilityRole="button">
              <X color="#1C4532" size={24} />
            </TouchableOpacity>
          </View>

          {/* Chat History */}
          <ScrollView className="flex-1 p-4">
            {messages.map((msg) => (
              <View key={msg.id} className={`mb-4 max-w-[80%] rounded-xl p-3 ${msg.role === 'USER' ? 'bg-brand-green self-end' : 'bg-brand-white self-start border border-brand-lightNeutral'}`}>
                <Text className={msg.role === 'USER' ? 'text-brand-white' : 'text-brand-neutral'}>{msg.text}</Text>
              </View>
            ))}
            {isTyping && (
              <View className="bg-brand-white self-start border border-brand-lightNeutral rounded-xl p-3 max-w-[20%]">
                <ActivityIndicator size="small" color="#1C4532" />
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View className="p-4 bg-brand-white border-t border-brand-lightNeutral flex-row items-center">
            <View className="flex-1 mr-2">
              <Input 
                label="" 
                placeholder="Type or speak naturally..." 
                value={inputText} 
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
              />
            </View>
            <TouchableOpacity 
              className="bg-brand-green p-4 rounded-xl items-center justify-center -mt-4"
              onPress={handleSend}
              accessibilityLabel="Send Message"
            >
              <Send color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

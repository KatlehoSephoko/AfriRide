import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  return (
    <View className="mb-4 w-full">
      <Text 
        className="text-brand-neutral font-semibold mb-2"
        nativeID={`label-${label}`}
      >
        {label}
      </Text>
      <TextInput
        className={`bg-brand-white border ${error ? 'border-brand-danger' : 'border-brand-lightNeutral'} rounded-xl p-4 text-brand-neutral min-h-[56px]`}
        placeholderTextColor="#9CA3AF"
        accessible={true}
        accessibilityLabel={label}
        accessibilityHint={`Enter your ${label.toLowerCase()}`}
        accessibilityInvalid={!!error}
        accessibilityErrorMessage={error}
        {...props}
      />
      {error && (
        <Text className="text-brand-danger text-sm mt-1" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
};

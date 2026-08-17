import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  variant = 'primary', 
  isLoading = false, 
  disabled, 
  ...props 
}) => {
  const baseClasses = "flex-row items-center justify-center py-4 px-6 rounded-xl min-h-[56px]";
  
  const variants = {
    primary: "bg-brand-green",
    secondary: "bg-brand-cream border border-brand-green",
    danger: "bg-brand-danger",
    ghost: "bg-transparent",
  };

  const textVariants = {
    primary: "text-brand-white font-bold text-lg",
    secondary: "text-brand-green font-bold text-lg",
    danger: "text-brand-white font-bold text-lg",
    ghost: "text-brand-green font-semibold text-lg",
  };

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50' : 'opacity-100'}`}
      disabled={disabled || isLoading}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isLoading, busy: isLoading }}
      accessibilityLabel={title}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#1C4532'} />
      ) : (
        <Text className={textVariants[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

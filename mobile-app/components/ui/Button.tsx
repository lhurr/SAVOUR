import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../constants/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  disabled = false,
}) => {
  const buttonStyles = [
    styles.base,
    variant ? styles[variant] : null,
    size ? styles[`${size}Size`] : null,
    disabled && styles.disabled,
    style,
  ] as ViewStyle[];

  const textStyles = [
    styles.text,
    variant ? styles[`${variant}Text`] : null,
    size ? styles[`${size}Text`] : null,
    disabled && styles.disabledText,
    textStyle,
  ] as TextStyle[];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface.dark,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  // Sizes
  smallSize: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  mediumSize: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  largeSize: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  // Text styles
  text: {
    fontSize: typography.sizes.md,
    fontWeight: '600' as const,
  },
  primaryText: {
    color: colors.text.primary.dark,
  },
  secondaryText: {
    color: colors.text.primary.light,
  },
  outlineText: {
    color: colors.primary,
  },
  smallText: {
    fontSize: typography.sizes.sm,
  },
  mediumText: {
    fontSize: typography.sizes.md,
  },
  largeText: {
    fontSize: typography.sizes.lg,
  },
  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
}); 
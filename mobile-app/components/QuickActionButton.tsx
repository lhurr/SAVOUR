import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text as ThemedText } from './ui/Typography';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

interface QuickActionButtonProps {
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export default function QuickActionButton({ 
  title, 
  subtitle, 
  icon, 
  onPress, 
  variant = 'primary' 
}: QuickActionButtonProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <ThemedText style={styles.icon}>{icon}</ThemedText>
      <ThemedText 
        variant="body" 
        color={variant === 'primary' ? '#FFFFFF' : colors.text.primary.dark}
        style={styles.title}
      >
        {title}
      </ThemedText>
      {subtitle && (
        <ThemedText 
          variant="caption" 
          color={variant === 'primary' ? '#FFFFFF' : colors.text.secondary.dark}
          style={styles.subtitle}
        >
          {subtitle}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    ...shadows.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.surface.dark,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  icon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
}); 
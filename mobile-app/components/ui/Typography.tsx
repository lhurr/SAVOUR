import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { colors, typography } from '../../constants/theme';
import { useColorScheme } from 'react-native';

interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: string;
  style?: TextStyle;
  center?: boolean;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color,
  style,
  center = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textStyles = [
    styles.base,
    styles[variant],
    {
      color: color || (isDark ? colors.text.primary.dark : colors.text.primary.light),
      textAlign: center ? 'center' as const : undefined,
    } as TextStyle,
    style,
  ];

  return <RNText style={textStyles}>{children}</RNText>;
};

const styles = StyleSheet.create({
  base: {
    fontSize: typography.sizes.md,
    fontWeight: '400' as const,
  },
  h1: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '700' as const,
    letterSpacing: 2,
  },
  h2: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: typography.sizes.xl,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: typography.sizes.md,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: typography.sizes.sm,
    fontWeight: '400' as const,
    color: colors.text.secondary.dark,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: '500' as const,
  },
}); 
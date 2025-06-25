import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Typography';
import { colors, spacing, typography, borderRadius, mixins } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const router = useRouter();

  async function handleResetPassword() {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address to reset your password.');
      return;
    }

    setIsResettingPassword(true);
    setResetSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setResetSuccess(true);
        Alert.alert(
          'Password Reset Email Sent',
          'Check your email for a link to reset your password.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsResettingPassword(false);
    }
  }

  return (
    <View style={[mixins.container, styles.container]}>
      <View style={styles.titleContainer}>
        <Text variant="h3" center style={styles.tagline}>Find your next go-to grub with</Text>
        <Text variant="h1" color={colors.primary} style={styles.logoText}>SAVOUR</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text variant="h3" center style={styles.subtitle}>
          Reset Your Password
        </Text>
        <Text variant="caption" center style={styles.description}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>
        
        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.text.secondary.dark}
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        {resetSuccess && (
          <Text variant="caption" color={colors.success} center style={styles.success}>
            Password reset email sent! Check your inbox.
          </Text>
        )}
        
        <View style={styles.buttonContainer}>
          <Button
            title="Back to Login"
            onPress={() => router.push('/login')}
            variant="outline"
            size="medium"
            style={styles.button}
            textStyle={styles.buttonText}
          />
          <Button
            title={isResettingPassword ? "Sending..." : "Reset Password"}
            onPress={handleResetPassword}
            variant="primary"
            size="medium"
            style={styles.button}
            textStyle={styles.buttonText}
            disabled={isResettingPassword}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tagline: {
    fontSize: typography.sizes.xl,
    marginBottom: spacing.xs,
  },
  logoText: {
    fontSize: typography.sizes.xxxl * 1.5,
    marginTop: 0,
    textShadowColor: colors.primaryDark,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 2,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    marginBottom: spacing.sm,
    color: colors.text.primary.dark,
  },
  description: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.lg,
    color: colors.text.secondary.dark,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: colors.border.dark,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface.dark,
    color: colors.text.primary.dark,
    fontSize: typography.sizes.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '80%',
  },
  button: {
    flex: 1,
  },
  success: {
    marginBottom: spacing.md,
  },
  buttonText: {
    textAlign: 'center',
  },
}); 
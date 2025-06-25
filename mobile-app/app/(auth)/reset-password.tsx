import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Typography';
import { colors, spacing, typography, borderRadius, mixins } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams();

  // Check if we have the necessary tokens from the URL
  useEffect(() => {
    // The URL should contain access_token and refresh_token from Supabase
    if (!params.access_token) {
      setErrorMsg('Invalid or expired reset link. \n Please request a new password reset.');
    }
  }, [params]);

  async function handleResetPassword() {
    if (!password.trim()) {
      setErrorMsg('Please enter a new password.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsResetting(true);
    setErrorMsg('');

    try {
      // Set the session using the tokens from the URL
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: params.access_token as string,
        refresh_token: params.refresh_token as string,
      });

      if (sessionError) {
        setErrorMsg('Invalid or expired reset link. Please request a new password reset.');
        return;
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        Alert.alert(
          'Password Reset Successful',
          'Your password has been updated successfully. You can now log in with your new password.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login'),
            },
          ]
        );
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsResetting(false);
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
          Set New Password
        </Text>
        <Text variant="caption" center style={styles.description}>
          Enter your new password below.
        </Text>
        
        <TextInput
          placeholder="New Password"
          placeholderTextColor={colors.text.secondary.dark}
          style={styles.input}
          onChangeText={setPassword}
          value={password}
          secureTextEntry
        />
        
        <TextInput
          placeholder="Confirm New Password"
          placeholderTextColor={colors.text.secondary.dark}
          style={styles.input}
          onChangeText={setConfirmPassword}
          value={confirmPassword}
          secureTextEntry
        />
        
        {!!errorMsg && (
          <Text variant="caption" color={colors.error} center style={styles.error}>
            {errorMsg}
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
            title={isResetting ? "Updating..." : "Update Password"}
            onPress={handleResetPassword}
            variant="primary"
            size="medium"
            style={styles.button}
            textStyle={styles.buttonText}
            disabled={isResetting}
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
    marginBottom: spacing.sm,
    backgroundColor: colors.surface.dark,
    color: colors.text.primary.dark,
    fontSize: typography.sizes.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '80%',
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
  },
  buttonText: {
    textAlign: 'center',
  },
  error: {
    marginBottom: spacing.md,
  },
}); 
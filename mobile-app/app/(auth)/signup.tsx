import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Typography';
import { colors, spacing, typography, borderRadius, mixins } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  async function handleSignup() {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('');
        alert('Please check your email to confirm your account.');
        router.push('/login');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  return (
    <View style={[mixins.container, styles.container]}>
      <View style={styles.titleContainer}>
        <Text variant="h3" center style={styles.tagline}>Find your next go-to grub with</Text>
        <Text variant="h1" color={colors.primary} style={styles.logoText}>SAVOUR</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.text.secondary.dark}
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.text.secondary.dark}
          style={styles.input}
          onChangeText={setPassword}
          value={password}
          secureTextEntry
        />
        {!!errorMsg && (
          <Text variant="caption" color={colors.error} center style={styles.error}>
            {errorMsg}
          </Text>
        )}
        
        <View style={styles.buttonContainer}>
          <Button
            title="Log In"
            onPress={() => router.push('/login')}
            variant="outline"
            size="large"
            style={styles.button}
          />
          <Button
            title="Sign Up"
            onPress={handleSignup}
            variant="primary"
            size="large"
            style={styles.button}
          />
        </View>
        
        {/* Spacer to match login page layout */}
        <View style={styles.spacer} />
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
    marginTop: spacing.xs,
  },
  button: {
    flex: 1,
  },
  error: {
    marginBottom: spacing.md,
  },
  spacer: {
    height: spacing.md + spacing.xs + 23
  },
});

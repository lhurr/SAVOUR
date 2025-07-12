import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Typography';
import { colors, spacing, typography, borderRadius, mixins } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { signInWithGoogle } from '../../lib/googleAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('');
        router.replace('/home');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsLoading(true);
    try {
      const { data, error } = await signInWithGoogle();
      if (error) {
        setErrorMsg('Google sign-in failed');
      } else if (data?.url) {
        setErrorMsg('');
        router.replace('/home');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setIsLoading(false);
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
            onPress={handleLogin}
            variant="primary"
            size="large"
            style={styles.button}
            disabled={isLoading}
          />
          <Button
            title="Sign Up"
            onPress={() => router.push('./signup')}
            variant="outline"
            size="large"
            style={styles.button}
            disabled={isLoading}
          />
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text variant="caption" color={colors.text.secondary.dark} style={styles.dividerText}>
            OR
          </Text>
          <View style={styles.divider} />
        </View>

        <Button
          title="Continue with Google"
          onPress={handleGoogleLogin}
          variant="outline"
          size="large"
          style={styles.googleButton}
          disabled={isLoading}
        />

        <View style={styles.forgotPasswordContainer}>
          <Button
            title="Forgot your password?"
            onPress={() => router.push('./forgotpassword')}
            variant="outline"
            size="small"
            style={styles.forgotPasswordButton}
            disabled={isLoading}
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginVertical: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.dark,
  },
  dividerText: {
    marginHorizontal: spacing.md,
  },
  googleButton: {
    width: '80%',
    marginBottom: spacing.md,
  },
  forgotPasswordContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  forgotPasswordButton: {
    paddingVertical: spacing.xs,
  },
});

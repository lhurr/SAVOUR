import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have an access token (successful auth)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Successfully authenticated
          router.replace('/map');
        } else if (params.error) {
          console.error('Auth error:', params.error);
          router.replace('/login');
        } else {
          // If No session and no error, redirect to login
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/login');
      }
    };

    handleAuthCallback();
  }, [params, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.dark,
  },
  text: {
    color: colors.text.primary.dark,
    fontSize: typography.sizes.lg,
    marginBottom: spacing.md,
  },
}); 
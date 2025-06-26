import 'leaflet/dist/leaflet.css';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { useColorScheme, TouchableOpacity, Text, View, StyleSheet, Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '../lib/supabase';

import { Colors } from '../constants/Colors';
import { IconSymbol } from '../components/ui/IconSymbol';

const CustomHeader = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Text style={{ 
      color: '#19C37D',
      fontSize: 36,
      fontWeight: 'bold',
      letterSpacing: 3,
    }}>
      SAVOUR
    </Text>
  </View>
);

// Authentication state check to handle existing logged in users / new users
const useProtectedRoute = () => {
  const segments = useSegments();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const isAuthRoute = segments.length > 0 && segments[0] === '(auth)';
        const isTabsRoute = segments.length > 0 && segments[0] === '(tabs)';
        let isResetPasswordRoute = false;
        if (segments.length > 1) {
          isResetPasswordRoute = segments[1] === 'reset-password';
        }

        if (!session && isTabsRoute) {
          // If no session and trying to access tabs, redirect to login
          router.replace('/(auth)/login');
        } else if (session && isAuthRoute && !isResetPasswordRoute) {
          // If has session and on auth route (but not reset-password), redirect to home tab
          router.replace('/(tabs)/home');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [segments]);

  return isLoading;
};

export default function RootLayout() {
  const isLoading = useProtectedRoute();

  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.mobileContainer}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', 
    ...(Platform.OS === 'web' && {
      alignItems: 'center',
      justifyContent: 'center',
    }),
  },
  mobileContainer: {
    flex: 1,
    width: '100%',
    // maxWidth: 414, 
    backgroundColor: 'white',
    ...(Platform.OS === 'web' && {
      // alignItems: 'center',
      // justifyContent: 'center',
      maxWidth: 440,
      maxHeight: 956,
      height: '100%',
      boxSizing: 'border-box',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      overflow: 'hidden',
    }),
  },
});

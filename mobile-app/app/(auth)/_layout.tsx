import { Stack } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '../../components/ui/IconSymbol';

export default function AuthLayout() {
  const router = useRouter();
  
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: '#202123' },
        headerStyle: { backgroundColor: '#202123', borderBottomWidth: 0 },
        headerTintColor: '#FFFFFF',
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => router.replace('/')}
            style={{ marginLeft: 16 }}
          >
            <IconSymbol
              name={Platform.OS === 'ios' ? 'arrow.left' : 'arrow.left'}
              size={28}
              color={'#19C37D'}
            />
          </TouchableOpacity>
        ),
        headerTitle: '',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgotpassword" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
} 
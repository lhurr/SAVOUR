import 'leaflet/dist/leaflet.css';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { useColorScheme, TouchableOpacity, Text, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '../../lib/supabase';

import { Colors } from '../../constants/Colors';
import { IconSymbol } from '../../components/ui/IconSymbol';

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
        const isAuthRoute = ['login', 'signup'].includes(segments[0] || '');

        if (!session && !isAuthRoute) {
          // If no session and not on auth route, redirect to login
          router.replace('/login');
        } else if (session && isAuthRoute) {
          // If has session and on auth route, redirect to home
          router.replace('/');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [segments]);

  return isLoading;
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  
  // Use the protected route hook and get loading state
  const isLoading = useProtectedRoute();

  // Don't render anything while checking user authentication
  if (isLoading) {
    return null;
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('Error logging out: ' + error.message);
    } else {
      router.replace('/login');
    }
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#888',
        headerStyle: {
          backgroundColor: '#202123',
          borderBottomWidth: 0,
        },
        headerTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: '#202123',
          borderTopColor: '#444654',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          display: ['login', 'signup'].includes(route.name) ? 'none' : 'flex',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 0,
        },
        tabBarShowLabel: true,
        tabBarIconStyle: {
          marginBottom: -4,
        },
        headerRight: () => (
          ['login', 'signup'].includes(route.name) ? null : (
            <TouchableOpacity 
              onPress={handleLogout}
              style={{
                marginRight: 15,
                backgroundColor: '#19C37D',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Logout</Text>
            </TouchableOpacity>
          )
        ),
        headerShown: !['login', 'signup'].includes(route.name),
        headerTitle: () => ['index', 'chat', 'map'].includes(route.name) ? <CustomHeader /> : null,
      })}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color }) => <IconSymbol name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'CHAT',
          tabBarIcon: ({ color }) => <IconSymbol name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'MAP',
          tabBarIcon: ({ color }) => <IconSymbol name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color }) => <IconSymbol name="person.crop.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

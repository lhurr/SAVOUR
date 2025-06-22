import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme, TouchableOpacity, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('Error logging out: ' + error.message);
    } else {
      router.replace('/(auth)/login');
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
        ),
        headerTitle: () => <CustomHeader />,
      })}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color }) => <IconSymbol name="house.fill" color={color} />,
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
        name="restaurant-info"
        options={{
          title: 'INFO',
          tabBarIcon: ({ color }) => <IconSymbol name="magnifyingglass" color={color} />,
        }}
      />
    </Tabs>
  );
} 
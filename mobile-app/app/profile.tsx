import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Text } from '../components/ui/Typography'; 
import { supabase } from '../lib/supabase';
import { colors, spacing } from '../constants/theme'; 

export default function Profile() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setEmail(user?.email || null);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}> 
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}> {}
        <Text variant="h2" color={colors.text.primary.dark}>Profile</Text> {}
        <Text color={colors.text.primary.dark}>Email: {email}</Text> {}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%', 
    backgroundColor: colors.background.dark, 
    padding: spacing.md, 
  },
  contentContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
});
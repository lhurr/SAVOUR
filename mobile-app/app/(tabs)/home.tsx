import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../components/ui/Typography';
import { colors, spacing } from '../../constants/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text variant="h2" color={colors.text.primary.dark} center>Hello there.</Text>
        <Text variant="h2" color={colors.text.primary.dark} center>Welcome to SAVOUR, ready to feast?</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background.dark,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
}); 
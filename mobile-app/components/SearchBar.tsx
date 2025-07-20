import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text as ThemedText } from './ui/Typography';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search for restaurants, cuisines, or dishes...",
  loading = false 
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={colors.text.secondary.dark}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {loading && (
          <ActivityIndicator 
            size="small" 
            color={colors.primary} 
            style={styles.loadingIndicator}
          />
        )}
        
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <ThemedText variant="body" color={colors.text.secondary.dark}>
              ✕
            </ThemedText>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={handleSearch} 
          style={styles.searchButton}
          disabled={loading || !query.trim()}
        >
          <ThemedText variant="body" color="#FFFFFF">
            🔍
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.dark,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text.primary.dark,
  },
  loadingIndicator: {
    marginRight: spacing.sm,
  },
  clearButton: {
    padding: spacing.sm,
    marginRight: spacing.xs,
  },
  searchButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.xs,
  },
}); 
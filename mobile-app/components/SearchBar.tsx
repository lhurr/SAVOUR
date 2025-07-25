import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Text as ThemedText } from './ui/Typography';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search restaurants, cuisines, or dishes...",
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

  const handleSubmit = () => {
    handleSearch();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {/* Search Icon */}
        <View style={styles.iconContainer}>
          <ThemedText variant="body" color={colors.text.secondary.dark}>
            🔍
          </ThemedText>
        </View>

        {/* Input Field */}
        <TextInput
          style={styles.textInput}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={colors.text.secondary.dark}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
          selectionColor={colors.primary}
        />

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.actionContainer}>
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
          </View>
        )}

        {/* Clear Button */}
        {query.length > 0 && !loading && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            activeOpacity={0.7}
          >
            <View style={styles.clearButtonInner}>
              <ThemedText variant="body" color={colors.text.secondary.dark}>
                ✕
              </ThemedText>
            </View>
          </TouchableOpacity>
        )}

        {/* Search Button */}
        {query.length > 0 && !loading && (
          <TouchableOpacity
            onPress={handleSearch}
            style={styles.searchButton}
            activeOpacity={0.8}
            disabled={!query.trim()}
          >
            <ThemedText variant="body" color="#FFFFFF">
              Search
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Tips */}
      {query.length === 0 && (
        <View style={styles.tipsContainer}>
          <ThemedText variant="caption" color={colors.text.secondary.dark} style={styles.tipsText}>
            Try: pizza, sushi, coffee shops, romantic dinner
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.dark,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    // minHeight: 56,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.dark,
    // Gradient-like effect with subtle inner shadow
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  textInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary.dark,
    // Remove all borders and outlines
    borderWidth: 0,
    outline: 'none',
    outlineWidth: 0,
    // Remove focus styles completely
    '&:focus': {
      borderWidth: 0,
      outline: 'none',
      outlineWidth: 0,
      borderColor: 'transparent',
    },
  },
  actionContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  clearButtonInner: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.border.dark,
    borderRadius: borderRadius.round,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginLeft: spacing.xs,
    ...shadows.sm,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tipsContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  tipsText: {
    fontStyle: 'italic',
    opacity: 0.8,
  },
});
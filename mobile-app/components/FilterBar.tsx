import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Text as ThemedText } from './ui/Typography';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: FilterOption[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  title?: string;
}

export default function FilterBar({ 
  filters, 
  selectedFilter, 
  onFilterChange, 
  title = "Filter by" 
}: FilterBarProps) {
  return (
    <View style={styles.container}>
      <ThemedText variant="label" color={colors.text.secondary.dark} style={styles.title}>
        {title}
      </ThemedText>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              selectedFilter === filter.value && styles.filterButtonActive
            ]}
            onPress={() => onFilterChange(filter.value)}
          >
            <ThemedText 
              variant="body" 
              color={selectedFilter === filter.value ? '#FFFFFF' : colors.text.primary.dark}
              style={styles.filterText}
            >
              {filter.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.xs,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface.dark,
    borderWidth: 1,
    borderColor: colors.border.dark,
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
}); 
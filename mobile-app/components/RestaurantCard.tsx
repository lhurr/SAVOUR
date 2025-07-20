import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { RestaurantService } from '../lib/database';
import { RecommendedRestaurant } from '../lib/recommendation-service';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

interface RestaurantCardProps {
  restaurant: RecommendedRestaurant;
  onPress?: () => void;
  showSimilarityScore?: boolean;
}

export default function RestaurantCard({ 
  restaurant, 
  onPress, 
  showSimilarityScore = false 
}: RestaurantCardProps) {
  const router = useRouter();

  const handlePress = async () => {
    try {
      // Record interaction
      await RestaurantService.recordInteraction(
        restaurant.name,
        restaurant.address || '',
        restaurant.cuisine || '',
        'click'
      );
    } catch (error) {
      console.error('Error recording interaction:', error);
    }

    // Navigate to restaurant info
    router.push({
      pathname: '/restaurant-info',
      params: { 
        name: restaurant.name, 
        address: restaurant.address || '' 
      }
    });

    onPress?.();
  };

  const handleWebsitePress = () => {
    if (restaurant.website) {
      Linking.openURL(restaurant.website);
    }
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const formatSimilarityScore = (score: number): string => {
    return `${(score * 100).toFixed(0)}%`;
  };

  const getCuisineDisplay = (cuisine?: string): string => {
    if (!cuisine) return '';
    return cuisine
      .split(';')
      .map(c => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
      .join(', ');
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {restaurant.name}
          </Text>
          {showSimilarityScore && (
            <View style={styles.similarityBadge}>
              <Text style={styles.similarityText}>
                {formatSimilarityScore(restaurant.similarityScore)}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>
            {formatDistance(restaurant.distance)}
          </Text>
        </View>
      </View>

      {restaurant.cuisine && (
        <View style={styles.cuisineContainer}>
          <Text style={styles.cuisineLabel}>Cuisine:</Text>
          <Text style={styles.cuisineText}>
            {getCuisineDisplay(restaurant.cuisine)}
          </Text>
        </View>
      )}

      {restaurant.address && (
        <View style={styles.addressContainer}>
          <Text style={styles.addressText} numberOfLines={1}>
            📍 {restaurant.address}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        {restaurant.website && (
          <TouchableOpacity 
            style={styles.websiteButton}
            onPress={handleWebsitePress}
          >
            <Text style={styles.websiteText}>🌐 Website</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.detailsButton} onPress={handlePress}>
          <Text style={styles.detailsText}>View Details →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.dark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary.dark,
    lineHeight: 24,
  },
  similarityBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  similarityText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: '#FFFFFF',
  },
  distanceContainer: {
    backgroundColor: colors.background.dark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  distanceText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary.dark,
  },
  cuisineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cuisineLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary.dark,
    marginRight: spacing.xs,
  },
  cuisineText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary.dark,
    flex: 1,
  },
  addressContainer: {
    marginBottom: spacing.md,
  },
  addressText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary.dark,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  websiteButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.dark,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  websiteText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary.dark,
  },
  detailsButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  detailsText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: '#FFFFFF',
  },
}); 
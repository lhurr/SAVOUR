import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text } from '../../components/ui/Typography'; 
import { supabase } from '../../lib/supabase';
import { RestaurantService } from '../../lib/database';
import { UserRestaurantInteraction } from '../../lib/types';
import { colors, spacing, shadows, borderRadius } from '../../constants/theme'; 

interface InteractionStats {
  total_clicks: number;
  total_views: number;
  total_favorites: number;
  unique_restaurants: number;
}

export default function Profile() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<InteractionStats | null>(null);
  const [recentRestaurants, setRecentRestaurants] = useState<UserRestaurantInteraction[]>([]);
  const [favorites, setFavorites] = useState<UserRestaurantInteraction[]>([]);

  const fetchUserData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setEmail(user?.email || null);
      }

      // interaction statistics
      const interactionStats = await RestaurantService.getInteractionStats();
      setStats(interactionStats);

      // recent restaurants
      const recent = await RestaurantService.getRecentRestaurants(10);
      setRecentRestaurants(recent);

      // favorites
      const favoriteRestaurants = await RestaurantService.getFavoriteRestaurants();
      setFavorites(favoriteRestaurants);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ title, value, color, icon }: { title: string; value: number; color: string; icon: string }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );

  const RestaurantCard = ({ interaction }: { interaction: UserRestaurantInteraction }) => (
    <View style={styles.restaurantCard}>
      <View style={styles.restaurantHeader}>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>
            {interaction.restaurant_name}
          </Text>
          <View style={styles.restaurantMeta}>
            {interaction.restaurant_cuisine && (
              <View style={styles.cuisineTag}>
                <Text style={styles.cuisineText}>🍽️ {interaction.restaurant_cuisine}</Text>
              </View>
            )}
            <Text style={styles.restaurantDate}>
              {formatDate(interaction.interaction_date)}
            </Text>
          </View>
        </View>
      </View>
      {interaction.restaurant_address && (
        <Text style={styles.restaurantAddress}>
          📍 {interaction.restaurant_address}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}> 
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Welcome back!</Text>
            <Text style={styles.userEmail}>{email}</Text>
          </View>
        </View>
      </View>

      {/* Activity Statistics */}
      {stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              title="Restaurants Clicked" 
              value={stats.total_clicks} 
              color="#007AFF" 
              icon="👆"
            />
            <StatCard 
              title="Pages Viewed" 
              value={stats.total_views} 
              color="#34C759" 
              icon="👁️"
            />
            <StatCard 
              title="Favorites" 
              value={stats.total_favorites} 
              color="#FF3B30" 
              icon="❤️"
            />
            <StatCard 
              title="Unique Places" 
              value={stats.unique_restaurants} 
              color="#FF9500" 
              icon="📍"
            />
          </View>
        </View>
      )}

      {/* recent Restaurants */}
      {recentRestaurants.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Visits</Text>
            {/* <Text style={styles.favoriteIndicator}>❤️ Favorites</Text> */}
          </View>
          {recentRestaurants.map((interaction) => (
            <RestaurantCard key={interaction.id} interaction={interaction} />
          ))}
        </View>
      )}

      {/* fav Restaurants */}
      {favorites.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Restaurants</Text>
          {favorites.map((interaction) => (
            <View key={interaction.id} style={[styles.restaurantCard, styles.favoriteCard]}>
              <View style={styles.restaurantHeader}>
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>
                    ❤️ {interaction.restaurant_name}
                  </Text>
                  <View style={styles.restaurantMeta}>
                    {interaction.restaurant_cuisine && (
                      <View style={styles.cuisineTag}>
                        <Text style={styles.cuisineText}>🍽️ {interaction.restaurant_cuisine}</Text>
                      </View>
                    )}
                    <Text style={styles.restaurantDate}>
                      {formatDate(interaction.interaction_date)}
                    </Text>
                  </View>
                </View>
              </View>
              {interaction.restaurant_address && (
                <Text style={styles.restaurantAddress}>
                  📍 {interaction.restaurant_address}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Empty */}
      {recentRestaurants.length === 0 && favorites.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🍽️</Text>
          <Text style={styles.emptyStateText}>No restaurant interactions yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Start exploring restaurants on the map to see your activity here!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text.secondary.light,
  },
  headerSection: {
    backgroundColor: colors.primary,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary.light,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary.light,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary.light,
    fontWeight: '500',
  },
  restaurantCard: {
    backgroundColor: 'white',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  favoriteCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  restaurantHeader: {
    marginBottom: spacing.xs,
  },
  restaurantInfo: {
    gap: spacing.xs,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary.light,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  cuisineTag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  cuisineText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  restaurantAddress: {
    fontSize: 14,
    color: colors.text.secondary.light,
    marginTop: spacing.xs,
  },
  restaurantDate: {
    fontSize: 12,
    color: colors.text.secondary.light,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary.light,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favoriteIndicator: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
});
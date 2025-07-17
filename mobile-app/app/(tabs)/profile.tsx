import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Text } from '../../components/ui/Typography'; 
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { RestaurantService } from '../../lib/database';
import { UserRestaurantInteraction } from '../../lib/types';
import { colors, spacing, shadows, borderRadius } from '../../constants/theme'; 

interface InteractionStats {
  total_clicks: number;
  total_favorites: number;
  unique_restaurants: number;
}

interface PaginationData {
  data: UserRestaurantInteraction[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function Profile() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<InteractionStats | null>(null);
  

  const [recentRestaurants, setRecentRestaurants] = useState<PaginationData>({
    data: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [recentLoading, setRecentLoading] = useState(false);
  
  // Favorites pagination
  const [favorites, setFavorites] = useState<PaginationData>({
    data: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const PAGE_SIZE = 5;

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

      // recent restaurants with pagination
      const recentData = await RestaurantService.getRecentRestaurantsPaginated(1, PAGE_SIZE);
      setRecentRestaurants(recentData);

      // favorites with pagination
      const favoritesData = await RestaurantService.getFavoriteRestaurantsPaginated(1, PAGE_SIZE);
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentRestaurants = async (page: number) => {
    setRecentLoading(true);
    try {
      const data = await RestaurantService.getRecentRestaurantsPaginated(page, PAGE_SIZE);
      setRecentRestaurants(data);
    } catch (error) {
      console.error('Error fetching recent restaurants:', error);
    } finally {
      setRecentLoading(false);
    }
  };

  const fetchFavorites = async (page: number) => {
    setFavoritesLoading(true);
    try {
      const data = await RestaurantService.getFavoriteRestaurantsPaginated(page, PAGE_SIZE);
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setFavoritesLoading(false);
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

  // StatCard: unified color, fixed size for all cards
  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: string }) => (
    <View style={{
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      minHeight: 120,
      maxHeight: 120,
      width: 110,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.10,
      shadowRadius: 4,
      elevation: 2,
    }}>
      <Text style={{ fontSize: 28, color: 'white', marginBottom: 4 }}>{icon}</Text>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 2 }}>{value}</Text>
      <Text style={{ fontSize: 14, color: 'white', fontWeight: '600', textAlign: 'center' }}>{title}</Text>
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

  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    hasNextPage, 
    hasPrevPage, 
    onNext, 
    onPrev, 
    loading 
  }: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    onNext: () => void;
    onPrev: () => void;
    loading: boolean;
  }) => (
    <View style={styles.paginationContainer}>
      <Button
        title="← Previous"
        variant="outline"
        size="small"
        onPress={onPrev}
        disabled={!hasPrevPage || loading}
        style={styles.paginationButton}
      />
      
      <View style={styles.paginationInfo}>
        <Text style={styles.paginationText}>
          Page {currentPage} of {totalPages}
        </Text>
      </View>
      
      <Button
        title="Next →"
        variant="outline"
        size="small"
        onPress={onNext}
        disabled={!hasNextPage || loading}
        style={styles.paginationButton}
      />
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
            <StatCard 
              title="Restaurants Clicked" 
              value={stats.total_clicks} 
              icon="👆"
            />
            <StatCard 
              title="Favorites" 
              value={stats.total_favorites} 
              icon="❤️"
            />
            <StatCard 
              title="Unique Places" 
              value={stats.unique_restaurants} 
              icon="📍"
            />
          </View>
        </View>
      )}

      {/* Recent Restaurants */}
      {recentRestaurants.totalCount > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Visits</Text>
            <Text style={styles.sectionSubtitle}>
              {recentRestaurants.totalCount} total visits
            </Text>
          </View>
          
          {recentLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <>
              {recentRestaurants.data.map((interaction) => (
                <RestaurantCard key={interaction.id} interaction={interaction} />
              ))}
              
              {recentRestaurants.totalPages > 1 && (
                <PaginationControls
                  currentPage={recentRestaurants.currentPage}
                  totalPages={recentRestaurants.totalPages}
                  hasNextPage={recentRestaurants.hasNextPage}
                  hasPrevPage={recentRestaurants.hasPrevPage}
                  onNext={() => fetchRecentRestaurants(recentRestaurants.currentPage + 1)}
                  onPrev={() => fetchRecentRestaurants(recentRestaurants.currentPage - 1)}
                  loading={recentLoading}
                />
              )}
            </>
          )}
        </View>
      )}

      {/* Favorite Restaurants */}
      {favorites.totalCount > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favorite Restaurants</Text>
            <Text style={styles.sectionSubtitle}>
              {favorites.totalCount} total favorites
            </Text>
          </View>
          
          {favoritesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <>
              {favorites.data.map((interaction) => (
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
              
              {favorites.totalPages > 1 && (
                <PaginationControls
                  currentPage={favorites.currentPage}
                  totalPages={favorites.totalPages}
                  hasNextPage={favorites.hasNextPage}
                  hasPrevPage={favorites.hasPrevPage}
                  onNext={() => fetchFavorites(favorites.currentPage + 1)}
                  onPrev={() => fetchFavorites(favorites.currentPage - 1)}
                  loading={favoritesLoading}
                />
              )}
            </>
          )}
        </View>
      )}

      {/* Empty State */}
      {recentRestaurants.totalCount === 0 && favorites.totalCount === 0 && (
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
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary.light,
    marginTop: spacing.xs,
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#F0F0F0',
    borderRadius: borderRadius.md,
  },
  paginationButton: {
    minWidth: 80,
  },
  paginationInfo: {
    paddingHorizontal: spacing.md,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary.light,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
});
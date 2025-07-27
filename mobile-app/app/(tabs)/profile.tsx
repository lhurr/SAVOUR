import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
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
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

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

  const handleDeleteInteraction = async (interactionId: string, type: 'favorite' | 'recent') => {
    setDeleteLoading(interactionId);
    try {
      await RestaurantService.deleteInteraction(interactionId);

      // Refresh the appropriate data
      if (type === 'favorite') {
        await fetchFavorites(favorites.currentPage);
      } else {
        await fetchRecentRestaurants(recentRestaurants.currentPage);
      }

      // Refresh stats
      const interactionStats = await RestaurantService.getInteractionStats();
      setStats(interactionStats);
    } catch (error) {
      console.error('Error deleting interaction:', error);
      Alert.alert('Error', 'Failed to delete item. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteAllFavorites = () => {
    Alert.alert(
      'Delete All Favorites',
      'Are you sure you want to delete all your favorite restaurants? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            setDeleteLoading('all-favorites');
            try {
              await RestaurantService.deleteAllFavorites();
              await fetchFavorites(1);
              const interactionStats = await RestaurantService.getInteractionStats();
              setStats(interactionStats);
            } catch (error) {
              console.error('Error deleting all favorites:', error);
              Alert.alert('Error', 'Failed to delete favorites. Please try again.');
            } finally {
              setDeleteLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleDeleteAllRecentVisits = () => {
    Alert.alert(
      'Delete All Recent Visits',
      'Are you sure you want to delete all your recent restaurant visits? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            setDeleteLoading('all-recent');
            try {
              await RestaurantService.deleteAllRecentVisits();
              await fetchRecentRestaurants(1);
              const interactionStats = await RestaurantService.getInteractionStats();
              setStats(interactionStats);
            } catch (error) {
              console.error('Error deleting all recent visits:', error);
              Alert.alert('Error', 'Failed to delete recent visits. Please try again.');
            } finally {
              setDeleteLoading(null);
            }
          }
        }
      ]
    );
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

  // Enhanced StatCard with gradient-like effect and better design
  const StatCard = ({ title, value, icon, gradient }: {
    title: string;
    value: number;
    icon: string;
    gradient: string[];
  }) => (
    <View style={[styles.statCard, { backgroundColor: gradient[0] }]}>
      <View style={styles.statCardOverlay}>
        <View style={styles.statIconContainer}>
          <Text style={styles.statIcon}>{icon}</Text>
        </View>
        <Text style={styles.statValue}>{value.toLocaleString()}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const RestaurantCard = ({
    interaction,
    type,
    showDelete = true
  }: {
    interaction: UserRestaurantInteraction;
    type: 'favorite' | 'recent';
    showDelete?: boolean;
  }) => (
    <View style={[
      styles.modernCard,
      type === 'favorite' && styles.favoriteCard
    ]}>
      <View style={styles.cardContent}>
        <View style={styles.restaurantInfo}>
          <View style={styles.restaurantHeader}>
            <Text style={styles.modernRestaurantName}>
              {type === 'favorite' ? '❤️ ' : ''}{interaction.restaurant_name}
            </Text>
            {showDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteInteraction(interaction.id, type)}
                disabled={deleteLoading === interaction.id}
              >
                {deleteLoading === interaction.id ? (
                  <ActivityIndicator size="small" color="#FF3B30" />
                ) : (
                  <Text style={styles.deleteIcon}>✕</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.restaurantMeta}>
            {interaction.restaurant_cuisine && (
              <View style={styles.modernCuisineTag}>
                <Text style={styles.modernCuisineText}>🍽️ {interaction.restaurant_cuisine}</Text>
              </View>
            )}
            <Text style={styles.modernDate}>
              {formatDate(interaction.interaction_date)}
            </Text>
          </View>

          {interaction.restaurant_address && (
            <Text style={styles.modernAddress}>
              📍 {interaction.restaurant_address}
            </Text>
          )}
        </View>
      </View>
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
      {/* Enhanced Header Section with Gradient Effect */}
      <View style={styles.headerSection}>
        <View style={styles.headerGradientOverlay}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarGlow}>
                <Text style={styles.avatarText}>
                  {email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Welcome back! 👋</Text>
              <Text style={styles.userEmail}>{email}</Text>
              <View style={styles.userBadge}>
                <Text style={styles.userBadgeText}>🌟 Food Explorer</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Activity Statistics */}
      {stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Overview</Text>
          <View style={styles.statsContainer}>
            <StatCard
              title="Total Clicks"
              value={stats.total_clicks}
              icon="👆"
              gradient={[colors.primary, colors.primary]}
            />
            <StatCard
              title="Favorites"
              value={stats.total_favorites}
              icon="❤️"
              gradient={[colors.primary, colors.primary]}
            />
            <StatCard
              title="Unique Places"
              value={stats.unique_restaurants}
              icon="📍"
              gradient={[colors.primary, colors.primary]}
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
                <RestaurantCard key={interaction.id} interaction={interaction} type="recent" />
              ))}

              {recentRestaurants.totalCount > 0 && (
                <View style={styles.sectionActions}>
                  <TouchableOpacity
                    style={styles.deleteAllButton}
                    onPress={handleDeleteAllRecentVisits}
                    disabled={deleteLoading === 'all-recent'}
                  >
                    {deleteLoading === 'all-recent' ? (
                      <ActivityIndicator size="small" color="#FF3B30" />
                    ) : (
                      <>
                        <Text style={styles.deleteAllIcon}>🗑️</Text>
                        <Text style={styles.deleteAllText}>Clear All Recent Visits</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

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
                <RestaurantCard key={interaction.id} interaction={interaction} type="favorite" />
              ))}

              {favorites.totalCount > 0 && (
                <View style={styles.sectionActions}>
                  <TouchableOpacity
                    style={styles.deleteAllButton}
                    onPress={handleDeleteAllFavorites}
                    disabled={deleteLoading === 'all-favorites'}
                  >
                    {deleteLoading === 'all-favorites' ? (
                      <ActivityIndicator size="small" color="#FF3B30" />
                    ) : (
                      <>
                        <Text style={styles.deleteAllIcon}>🗑️</Text>
                        <Text style={styles.deleteAllText}>Clear All Favorites</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

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
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  headerGradientOverlay: {
    position: 'relative',
    zIndex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  userBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statCardOverlay: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statTitle: {
    fontSize: 13,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
  },
  favoriteCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  restaurantInfo: {
    gap: spacing.xs,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
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
  // Modern card styles
  modernCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardContent: {
    padding: spacing.lg,
  },
  modernRestaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: spacing.xs,
    flex: 1,
  },
  modernCuisineTag: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  modernCuisineText: {
    fontSize: 13,
    color: '#0066CC',
    fontWeight: '600',
  },
  modernDate: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  modernAddress: {
    fontSize: 14,
    color: '#888888',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
  },
  sectionActions: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FFE5E5',
    gap: spacing.sm,
  },
  deleteAllIcon: {
    fontSize: 16,
  },
  deleteAllText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },

});
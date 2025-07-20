import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator, 
  Alert,
  TouchableOpacity,
  Text
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Text as ThemedText } from '../../components/ui/Typography';
import RestaurantCard from '../../components/RestaurantCard';
import SearchBar from '../../components/SearchBar';
import FilterBar, { FilterOption } from '../../components/FilterBar';
import QuickActionButton from '../../components/QuickActionButton';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { RecommendationService, RecommendedRestaurant, Location as UserLocation } from '../../lib/recommendation-service';
import { RestaurantService } from '../../lib/database';

export default function HomeScreen() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<RecommendedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [hasTasteProfile, setHasTasteProfile] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [selectedCuisineFilter, setSelectedCuisineFilter] = useState('all');
  const [selectedDistanceFilter, setSelectedDistanceFilter] = useState('1km');

  const fetchRecommendations = async (location: UserLocation) => {
    try {
      setLoading(true);
      
      // Check if user has a taste profile
      const tasteVector = await RestaurantService.getUserTasteProfileVector();
      setHasTasteProfile(!!tasteVector);
      
      // Get recommendations
      const recs = await RecommendationService.getRestaurantRecommendations(
        location,
        getDistanceInMeters(selectedDistanceFilter),
        10 // top 20 recommendations
      );
      
      setRecommendations(recs);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      Alert.alert('Error', 'Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userLocation) {
      await fetchRecommendations(userLocation);
    }
    setRefreshing(false);
  };

  const handleSearch = async (query: string) => {
    try {
      setSearchLoading(true);
      setIsSearchMode(true);
      
      const results = await RecommendationService.getSemanticRecommendations(
        query,
        0.7, // Lower threshold for search
        15 // More results for search
      );
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
      Alert.alert('Error', 'Failed to search. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setIsSearchMode(false);
    setSearchResults([]);
  };

  const cuisineFilters: FilterOption[] = [
    { label: 'All Cuisines', value: 'all' },
    { label: 'Italian', value: 'italian' },
    { label: 'Chinese', value: 'chinese' },
    { label: 'Japanese', value: 'japanese' },
    { label: 'Indian', value: 'indian' },
    { label: 'Mexican', value: 'mexican' },
    { label: 'Thai', value: 'thai' },
    { label: 'American', value: 'american' },
    { label: 'Mediterranean', value: 'mediterranean' },
  ];

  const distanceFilters: FilterOption[] = [
    { label: '1km', value: '1km' },
    { label: '2km', value: '2km' },
    { label: '5km', value: '5km' },
    { label: '10km', value: '10km' },
  ];

  const getDistanceInMeters = (distanceFilter: string): number => {
    switch (distanceFilter) {
      case '1km': return 1000;
      case '2km': return 2000;
      case '5km': return 5000;
      case '10km': return 10000;
      default: return 2000;
    }
  };

  const getLocationAndRecommendations = async () => {
    try {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'SAVOUR needs location access to recommend nearby restaurants. Please enable location permissions in your settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const location: UserLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setUserLocation(location);
      await fetchRecommendations(location);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please check your location settings.');
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocationAndRecommendations();
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>


      <SearchBar 
        onSearch={handleSearch}
        loading={searchLoading}
      />

      {!isSearchMode && (
        <>
          <FilterBar
            filters={distanceFilters}
            selectedFilter={selectedDistanceFilter}
            onFilterChange={(filter) => {
              setSelectedDistanceFilter(filter);
              if (userLocation) {
                fetchRecommendations(userLocation);
              }
            }}
            title="Distance"
          />
          
          <FilterBar
            filters={cuisineFilters}
            selectedFilter={selectedCuisineFilter}
            onFilterChange={setSelectedCuisineFilter}
            title="Cuisine Type"
          />
        </>
      )}

      {!isSearchMode && (
        <>
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <ThemedText variant="h3" color={colors.text.primary.dark} center>
                {recommendations.length}
              </ThemedText>
              <ThemedText variant="body" color={colors.text.secondary.dark} center>
                Nearby Restaurants
              </ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <ThemedText variant="h3" color={colors.text.primary.dark} center>
                {hasTasteProfile ? '✓' : '?'}
              </ThemedText>
              <ThemedText variant="body" color={colors.text.secondary.dark} center>
                Taste Profile
              </ThemedText>
            </View>
          </View>

          <View style={styles.recommendationsHeader}>
            <ThemedText variant="h3" color={colors.text.primary.dark}>
              {hasTasteProfile ? 'Personalized Recommendations' : 'Nearby Restaurants'}
            </ThemedText>
            <ThemedText variant="body" color={colors.text.secondary.dark}>
              {hasTasteProfile 
                ? 'Based on your dining preferences and location'
                : 'Explore restaurants near you to build your taste profile'
              }
            </ThemedText>
          </View>
        </>
      )}

      {isSearchMode && (
        <View style={styles.searchHeader}>
          <ThemedText variant="h3" color={colors.text.primary.dark}>
            Search Results
          </ThemedText>
          <ThemedText variant="body" color={colors.text.secondary.dark}>
            Based on your search query and dining history
          </ThemedText>
          <TouchableOpacity style={styles.clearSearchButton} onPress={clearSearch}>
            <ThemedText variant="body" color={colors.primary}>
              ← Back to Recommendations
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderRecommendations = () => {
    if (isSearchMode) {
      if (searchLoading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText variant="body" color={colors.text.secondary.dark} center>
              Searching for restaurants...
            </ThemedText>
          </View>
        );
      }

      if (searchResults.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <ThemedText variant="h3" color={colors.text.secondary.dark} center>
              No restaurants found
            </ThemedText>
            <ThemedText variant="body" color={colors.text.secondary.dark} center>
              Try a different search term or explore nearby restaurants
            </ThemedText>
          </View>
        );
      }

      return (
        <View style={styles.recommendationsContainer}>
          {searchResults.map((result, index) => (
            <View key={index} style={styles.searchResultCard}>
              <ThemedText variant="h3" color={colors.text.primary.dark}>
                {result.restaurant_name}
              </ThemedText>
              {result.restaurant_cuisine && (
                <ThemedText variant="body" color={colors.text.secondary.dark}>
                  Cuisine: {result.restaurant_cuisine}
                </ThemedText>
              )}
              {result.restaurant_address && (
                <ThemedText variant="body" color={colors.text.secondary.dark}>
                  Address: {result.restaurant_address}
                </ThemedText>
              )}
              <ThemedText variant="body" color={colors.primary}>
                Match: {(result.similarity * 100).toFixed(0)}%
              </ThemedText>
            </View>
          ))}
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText variant="body" color={colors.text.secondary.dark} center>
            Finding the perfect restaurants for you...
          </ThemedText>
        </View>
      );
    }

    if (recommendations.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText variant="h3" color={colors.text.secondary.dark} center>
            No restaurants found nearby
          </ThemedText>
          <ThemedText variant="body" color={colors.text.secondary.dark} center>
            Try expanding your search radius or check your location settings
          </ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <ThemedText variant="body" color="#FFFFFF" center>
              Try Again
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    // Filter recommendations by cuisine if not "all"
    const filteredRecommendations = selectedCuisineFilter === 'all' 
      ? recommendations 
      : recommendations.filter(restaurant => 
          restaurant.cuisine && 
          restaurant.cuisine.toLowerCase().includes(selectedCuisineFilter.toLowerCase())
        );

    return (
      <View style={styles.recommendationsContainer}>
        {filteredRecommendations.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            showSimilarityScore={hasTasteProfile}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderRecommendations()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.xl,
  },
  welcomeSection: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  statsSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface.dark,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border.dark,
    alignItems: 'center',
  },
  recommendationsHeader: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  recommendationsContainer: {
    gap: spacing.md,
  },
  searchHeader: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  clearSearchButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  searchResultCard: {
    backgroundColor: colors.surface.dark,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border.dark,
    gap: spacing.xs,
  },
  quickActionsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
}); 
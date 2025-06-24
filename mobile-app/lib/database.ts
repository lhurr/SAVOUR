import { supabase } from './supabase';
import { 
  UserRestaurantInteraction, 
  TABLES 
} from './types';

export class RestaurantService {
  static async recordInteraction(
    restaurantName: string,
    restaurantAddress: string,
    restaurantCuisine: string,
    interactionType: 'click' | 'view' | 'favorite'
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from(TABLES.USER_RESTAURANT_INTERACTIONS)
      .insert({
        user_id: user.id,
        restaurant_name: restaurantName,
        restaurant_address: restaurantAddress,
        restaurant_cuisine: restaurantCuisine,
        interaction_type: interactionType,
        interaction_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording interaction:', error);
      throw error;
    }

    return data;
  }

  static async getUserInteractions(): Promise<UserRestaurantInteraction[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from(TABLES.USER_RESTAURANT_INTERACTIONS)
      .select('*')
      .eq('user_id', user.id)
      .order('interaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching user interactions:', error);
      throw error;
    }

    return data || [];
  }

  static async getInteractionsByType(interactionType: 'click' | 'view' | 'favorite') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from(TABLES.USER_RESTAURANT_INTERACTIONS)
      .select('*')
      .eq('user_id', user.id)
      .eq('interaction_type', interactionType)
      .order('interaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching interactions by type:', error);
      throw error;
    }

    return data || [];
  }

  static async getRecentRestaurants(limit: number = 10) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from(TABLES.USER_RESTAURANT_INTERACTIONS)
      .select('*')
      .eq('user_id', user.id)
      .eq('interaction_type', 'click')
      .order('interaction_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent restaurants:', error);
      throw error;
    }

    return data || [];
  }

  // favorite restaurants
  static async getFavoriteRestaurants() {
    return this.getInteractionsByType('favorite');
  }

  // Toggle favorite status
  static async toggleFavorite(restaurantName: string, restaurantAddress: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from(TABLES.USER_RESTAURANT_INTERACTIONS)
      .select()
      .eq('user_id', user.id)
      .eq('restaurant_name', restaurantName)
      .eq('restaurant_address', restaurantAddress)
      .eq('interaction_type', 'favorite')
      .single();

    if (existing) {
      const { error } = await supabase
        .from(TABLES.USER_RESTAURANT_INTERACTIONS)
        .delete()
        .eq('id', existing.id);

      if (error) {
        console.error('Error removing favorite:', error);
        throw error;
      }

      return { isFavorite: false };
    } else {
      // add to favorites
      const { data, error } = await supabase
        .from(TABLES.USER_RESTAURANT_INTERACTIONS)
        .insert({
          user_id: user.id,
          restaurant_name: restaurantName,
          restaurant_address: restaurantAddress,
          interaction_type: 'favorite',
          interaction_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding favorite:', error);
        throw error;
      }

      return { isFavorite: true, data };
    }
  }

  // interaction statistics
  static async getInteractionStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from(TABLES.USER_RESTAURANT_INTERACTIONS)
      .select('interaction_type, restaurant_name')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching interaction stats:', error);
      throw error;
    }

    const stats = {
      total_clicks: data.filter(d => d.interaction_type === 'click').length,
      total_views: data.filter(d => d.interaction_type === 'view').length,
      total_favorites: data.filter(d => d.interaction_type === 'favorite').length,
      unique_restaurants: new Set(data.map(d => `${d.restaurant_name}-${d.restaurant_address}`)).size
    };

    return stats;
  }
} 
import { supabase } from './supabase';
import { 
  UserRestaurantInteraction, 
  TABLES 
} from './types';
import { getOpenAIEmbedding } from './embedding-api';

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

    // Prepare string for embedding
    const inputString = restaurantCuisine
      ? `${restaurantName} serving ${restaurantCuisine} food`
      : restaurantName;
    let embedding: number[] | null = null;
    try {
      embedding = await getOpenAIEmbedding(inputString);
    } catch (e) {}

    const { data, error } = await supabase
      .from(TABLES.USER_RESTAURANT_INTERACTIONS)
      .insert({
        user_id: user.id,
        restaurant_name: restaurantName,
        restaurant_address: restaurantAddress,
        restaurant_cuisine: restaurantCuisine,
        interaction_type: interactionType,
        interaction_date: new Date().toISOString(),
        embedding,
      })
      .select()
      .single();

    if (error) {
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

  static async getRecentRestaurantsPaginated(page: number = 1, pageSize: number = 5) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from(TABLES.USER_RESTAURANT_INTERACTIONS)
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('interaction_type', 'click')
      .order('interaction_date', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching recent restaurants with pagination:', error);
      throw error;
    }

    return {
      data: data || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / pageSize),
      hasNextPage: page * pageSize < (count || 0),
      hasPrevPage: page > 1
    };
  }

  // favorite restaurants
  static async getFavoriteRestaurants() {
    return this.getInteractionsByType('favorite');
  }

  // favorite restaurants with pagination
  static async getFavoriteRestaurantsPaginated(page: number = 1, pageSize: number = 5) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from(TABLES.USER_RESTAURANT_INTERACTIONS)
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('interaction_type', 'favorite')
      .order('interaction_date', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching favorite restaurants with pagination:', error);
      throw error;
    }

    return {
      data: data || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / pageSize),
      hasNextPage: page * pageSize < (count || 0),
      hasPrevPage: page > 1
    };
  }

  // Toggle favorite status
  static async toggleFavorite(restaurantName: string, restaurantAddress: string, restaurantCuisine?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // at least one identifier
    if (!restaurantName && !restaurantAddress) {
      throw new Error('At least restaurant name or address is required');
    }

    // query based on available data
    let query = supabase
      .from(TABLES.USER_RESTAURANT_INTERACTIONS)
      .select()
      .eq('user_id', user.id)
      .eq('interaction_type', 'favorite');

    if (restaurantName && restaurantAddress) {
      // exact match
      query = query
        .eq('restaurant_name', restaurantName)
        .eq('restaurant_address', restaurantAddress);
    } else if (restaurantName) {
      // match by name
      query = query.eq('restaurant_name', restaurantName);
    } else if (restaurantAddress) {
      // match by address
      query = query.eq('restaurant_address', restaurantAddress);
    }

    const { data: existing } = await query.single();

    if (existing) {
      const { error } = await supabase
        .from(TABLES.USER_RESTAURANT_INTERACTIONS)
        .delete()
        .eq('id', existing.id);

      if (error) {
        throw error;
      }

      return { isFavorite: false };
    } else {
      // add to favorites
      // Prepare string for embedding
      const inputString = restaurantCuisine
        ? `${restaurantName} serving ${restaurantCuisine} food`
        : restaurantName;
      let embedding: number[] | null = null;
      try {
        embedding = await getOpenAIEmbedding(inputString);
      } catch (e) {}

      const insertData: any = {
        user_id: user.id,
        interaction_type: 'favorite',
        interaction_date: new Date().toISOString(),
        embedding,
      };

      if (restaurantName) {
        insertData.restaurant_name = restaurantName;
      }
      if (restaurantAddress) {
        insertData.restaurant_address = restaurantAddress;
      }
      if (restaurantCuisine) {
        insertData.restaurant_cuisine = restaurantCuisine;
      }

      const { data, error } = await supabase
        .from(TABLES.USER_RESTAURANT_INTERACTIONS)
        .insert(insertData)
        .select()
        .single();

      if (error) {
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
      .select('interaction_type, restaurant_name, restaurant_address')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching interaction stats:', error);
      throw error;
    }

    const stats = {
      total_clicks: data.filter(d => d.interaction_type === 'click').length,
      total_views: data.filter(d => d.interaction_type === 'view').length,
      total_favorites: data.filter(d => d.interaction_type === 'favorite').length,
      unique_restaurants: new Set(data.map(d => `${d.restaurant_name}-${d.restaurant_address || ''}`)).size
    };

    return stats;
  }

  // Calculate the user's taste profile vector as a weighted average of their restaurant embeddings
  static async getUserTasteProfileVector(): Promise<number[] | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from(TABLES.USER_RESTAURANT_INTERACTIONS)
      .select('embedding, interaction_type')
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) return null;

    // Assign weights and filter out missing embeddings
    const weightedEmbeddings: { vector: number[]; weight: number }[] = data
      .filter((row: any) => Array.isArray(row.embedding) && row.embedding.length > 0)
      .map((row: any) => ({
        vector: row.embedding,
        weight: row.interaction_type === 'favorite' ? 10 : 1
      }));

    if (weightedEmbeddings.length === 0) return null;

    // Calculate weighted average
    const vectorLength = weightedEmbeddings[0].vector.length;
    const sumVector = new Array(vectorLength).fill(0);
    let totalWeight = 0;
    for (const { vector, weight } of weightedEmbeddings) {
      for (let i = 0; i < vectorLength; i++) {
        sumVector[i] += vector[i] * weight;
      }
      totalWeight += weight;
    }
    if (totalWeight === 0) return null;
    const userVector = sumVector.map(v => v / totalWeight);
    return userVector;
  }
} 
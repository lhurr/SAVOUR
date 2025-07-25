import { supabase } from './supabase';
import { getOpenAIEmbedding } from './embedding-api';
import { RestaurantService } from './database';

export interface RecommendedRestaurant {
  id: string;
  name: string;
  lat: number;
  lon: number;
  cuisine?: string;
  address?: string;
  town?: string;
  website?: string;
  similarityScore: number;
  distance: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export class RecommendationService {
  private static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Calculate distance between two points using Haversine formula
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Fetch nearby restaurants from OpenStreetMap
  private static async fetchNearbyRestaurants(location: Location, radius: number = 2000): Promise<any[]> {
    const query = `[out:json];(node["amenity"~"restaurant|cafe|fast_food|bar|pub"](around:${radius},${location.latitude},${location.longitude}););out;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      return data.elements.map((el: any) => {
        const address = el.tags['addr:street'] 
          ? `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}`.trim() 
          : undefined;
        
        return {
          id: el.id.toString(),
          name: el.tags.name || 'Unnamed',
          lat: el.lat,
          lon: el.lon,
          cuisine: el.tags.cuisine,
          address: address,
          website: el.tags.website,
        };
      });
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
      return [];
    }
  }

  // Get restaurant recommendations based on user's taste profile and location
  static async getRestaurantRecommendations(
    location: Location, 
    maxDistance: number = 2000,
    limit: number = 20
  ): Promise<RecommendedRestaurant[]> {
    try {
      // Get user's taste profile vector
      const userTasteVector = await RestaurantService.getUserTasteProfileVector();
      console.log('USER TASTE PROFILE VECTOR:', userTasteVector);
      if (!userTasteVector) {
        // If no taste profile, return nearby restaurants sorted by distance
        const nearbyRestaurants = await this.fetchNearbyRestaurants(location, maxDistance);
        return nearbyRestaurants
          .map(restaurant => ({
            ...restaurant,
            similarityScore: 0,
            distance: this.calculateDistance(
              location.latitude, 
              location.longitude, 
              restaurant.lat, 
              restaurant.lon
            )
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, limit);
      }

      // Fetch nearby restaurants
      const nearbyRestaurants = await this.fetchNearbyRestaurants(location, maxDistance);
      
      // Calculate embeddings and similarity scores for each restaurant
      const recommendations: RecommendedRestaurant[] = [];
      
      for (const restaurant of nearbyRestaurants) {
        try {
          // Create embedding for the restaurant
          const restaurantText = restaurant.cuisine 
            ? `${restaurant.name} serving ${restaurant.cuisine} food`
            : restaurant.name;
          
          const restaurantEmbedding = await getOpenAIEmbedding(restaurantText);
          
          const similarityScore = this.cosineSimilarity(userTasteVector, restaurantEmbedding);
          
          const distance = this.calculateDistance(
            location.latitude, 
            location.longitude, 
            restaurant.lat, 
            restaurant.lon
          );
          
          recommendations.push({
            ...restaurant,
            similarityScore,
            distance
          });
        } catch (error) {
          console.error(`Error processing restaurant ${restaurant.name}:`, error);
          // Add restaurant with default similarity score
          recommendations.push({
            ...restaurant,
            similarityScore: 0,
            distance: this.calculateDistance(
              location.latitude, 
              location.longitude, 
              restaurant.lat, 
              restaurant.lon
            )
          });
        }
      }
      
      // Sort by similarity score (descending) and then by distance (ascending)
      return recommendations
        .sort((a, b) => {
          if (Math.abs(a.similarityScore - b.similarityScore) < 0.01) {
            return a.distance - b.distance;
          }
          return b.similarityScore - a.similarityScore;
        })
        .slice(0, limit);
        
    } catch (error) {
      console.error('Error getting restaurant recommendations:', error);
      return [];
    }
  }

  // Get recommendations using semantic search from user's interaction history
  static async getSemanticRecommendations(
    query: string,
    matchThreshold: number = 0.78,
    matchCount: number = 10
  ): Promise<any[]> {
    try {
      const queryEmbedding = await getOpenAIEmbedding(query);
      
      const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
      });

      if (error) {
        console.error('Error in semantic search:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting semantic recommendations:', error);
      return [];
    }
  }
} 
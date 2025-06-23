export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserRestaurantInteraction {
  id: string;
  user_id: string;
  restaurant_name: string;
  restaurant_address?: string;
  restaurant_cuisine?: string;
  interaction_type: 'click' | 'view' | 'favorite';
  interaction_date: string;
  created_at: string;
}

export const TABLES = {
  USERS: 'users',
  USER_RESTAURANT_INTERACTIONS: 'user_restaurant_interactions',
} as const; 
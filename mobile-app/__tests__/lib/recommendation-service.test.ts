import { RecommendationService, RecommendedRestaurant, Location } from '../../lib/recommendation-service';
import { RestaurantService } from '../../lib/database';
import { getOpenAIEmbedding } from '../../lib/embedding-api';
import { supabase } from '../../lib/supabase';


jest.mock('../../lib/database');
jest.mock('../../lib/embedding-api');
jest.mock('../../lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockedRestaurantService = RestaurantService as jest.Mocked<typeof RestaurantService>;
const mockedGetOpenAIEmbedding = getOpenAIEmbedding as jest.MockedFunction<typeof getOpenAIEmbedding>;

global.fetch = jest.fn();

describe('RecommendationService', () => {
  const mockLocation: Location = {
    latitude: 40.7128,
    longitude: -74.0060,
  };

  const mockRestaurant: RecommendedRestaurant = {
    id: '1',
    name: 'Test Restaurant',
    lat: 40.7128,
    lon: -74.0060,
    cuisine: 'Italian',
    address: '123 Test St',
    similarityScore: 0.85,
    distance: 500,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getRestaurantRecommendations', () => {
    it('returns nearby restaurants when user has no taste profile', async () => {
      mockedRestaurantService.getUserTasteProfileVector.mockResolvedValue(null);

      const mockOSMResponse = {
        elements: [
          {
            id: 1,
            lat: 40.7128,
            lon: -74.0060,
            tags: {
              name: 'Test Restaurant',
              cuisine: 'Italian',
              'addr:street': 'Test St',
              'addr:housenumber': '123',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockOSMResponse),
      });

      const result = await RecommendationService.getRestaurantRecommendations(mockLocation);

      expect(mockedRestaurantService.getUserTasteProfileVector).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('overpass-api.de/api/interpreter')
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: '1',
        name: 'Test Restaurant',
        cuisine: 'Italian',
        address: '123 Test St',
        similarityScore: 0,
      });
    });

    it('returns recommendations with similarity scores when user has taste profile', async () => {
      const mockTasteVector = [0.1, 0.2, 0.3, 0.4, 0.5];
      mockedRestaurantService.getUserTasteProfileVector.mockResolvedValue(mockTasteVector);

      const mockOSMResponse = {
        elements: [
          {
            id: 1,
            lat: 40.7128,
            lon: -74.0060,
            tags: {
              name: 'Test Restaurant',
              cuisine: 'Italian',
            },
          },
        ],
      };

      const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];
      mockedGetOpenAIEmbedding.mockResolvedValue(mockEmbedding);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockOSMResponse),
      });

      const result = await RecommendationService.getRestaurantRecommendations(mockLocation);

      expect(mockedRestaurantService.getUserTasteProfileVector).toHaveBeenCalled();
      expect(mockedGetOpenAIEmbedding).toHaveBeenCalledWith('Test Restaurant serving Italian food');
      expect(result).toHaveLength(1);
      expect(result[0].similarityScore).toBeGreaterThan(0);
    });

    it('handles errors gracefully and returns empty array', async () => {
      mockedRestaurantService.getUserTasteProfileVector.mockRejectedValue(new Error('Database error'));

      const result = await RecommendationService.getRestaurantRecommendations(mockLocation);

      expect(result).toEqual([]);
    });

    it('respects maxDistance and limit parameters', async () => {
      mockedRestaurantService.getUserTasteProfileVector.mockResolvedValue(null);

      const mockOSMResponse = {
        elements: Array.from({ length: 30 }, (_, i) => ({
          id: i + 1,
          lat: 40.7128,
          lon: -74.0060,
          tags: {
            name: `Restaurant ${i + 1}`,
          },
        })),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockOSMResponse),
      });

      const result = await RecommendationService.getRestaurantRecommendations(mockLocation, 1000, 5);

      expect(result).toHaveLength(5);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('around%3A1000%2C40.7128%2C-74.006')
      );
    });
  });

  describe('getSemanticRecommendations', () => {
    it('returns semantic search results', async () => {
      const mockQuery = 'Italian food';
      const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];
      const mockSearchResults = [
        {
          id: '1',
          restaurant_name: 'Italian Place',
          restaurant_address: '123 Main St',
          restaurant_cuisine: 'Italian',
          similarity: 0.85,
        },
      ];

      mockedGetOpenAIEmbedding.mockResolvedValue(mockEmbedding);

      supabase.rpc.mockResolvedValue({
        data: mockSearchResults,
        error: null,
      });

      const result = await RecommendationService.getSemanticRecommendations(mockQuery);

      expect(mockedGetOpenAIEmbedding).toHaveBeenCalledWith(mockQuery);
      expect(supabase.rpc).toHaveBeenCalledWith('match_documents', {
        query_embedding: mockEmbedding,
        match_threshold: 0.78,
        match_count: 10,
      });
      expect(result).toEqual(mockSearchResults);
    });

    it('handles custom threshold and count parameters', async () => {
      const mockQuery = 'Pizza';
      const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];

      mockedGetOpenAIEmbedding.mockResolvedValue(mockEmbedding);

      supabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      await RecommendationService.getSemanticRecommendations(mockQuery, 0.5, 5);

      expect(supabase.rpc).toHaveBeenCalledWith('match_documents', {
        query_embedding: mockEmbedding,
        match_threshold: 0.5,
        match_count: 5,
      });
    });

    it('handles Supabase errors gracefully', async () => {
      const mockQuery = 'Sushi';
      const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];

      mockedGetOpenAIEmbedding.mockResolvedValue(mockEmbedding);

      supabase.rpc.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      const result = await RecommendationService.getSemanticRecommendations(mockQuery);

      expect(result).toEqual([]);
    });

    it('handles embedding errors gracefully', async () => {
      const mockQuery = 'Burger';

      mockedGetOpenAIEmbedding.mockRejectedValue(new Error('Embedding error'));

      const result = await RecommendationService.getSemanticRecommendations(mockQuery);

      expect(result).toEqual([]);
    });
  });
});
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

class RecommendationService {
  async getRecommendations(userId: string) {
    const response = await axios.get(`/api/recommendations/${userId}`);
    return response.data;
  }

  async createRecommendation(data: any) {
    const response = await axios.post('/api/recommendations', data);
    return response.data;
  }
}

describe('RecommendationService', () => {
  let service: RecommendationService;

  beforeEach(() => {
    service = new RecommendationService();
    jest.clearAllMocks();
  });

  it('fetches recommendations for user', async () => {
    const mockData = [{ id: 1, title: 'Test Recommendation' }];
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const result = await service.getRecommendations('user123');

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/recommendations/user123');
    expect(result).toEqual(mockData);
  });

  it('creates new recommendation', async () => {
    const newRecommendation = { title: 'New Recommendation', userId: 'user123' };
    const mockResponse = { id: 1, ...newRecommendation };
    mockedAxios.post.mockResolvedValue({ data: mockResponse });

    const result = await service.createRecommendation(newRecommendation);

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/recommendations', newRecommendation);
    expect(result).toEqual(mockResponse);
  });

  it('handles API errors', async () => {
    mockedAxios.get.mockRejectedValue(new Error('API Error'));

    await expect(service.getRecommendations('user123')).rejects.toThrow('API Error');
  });
});
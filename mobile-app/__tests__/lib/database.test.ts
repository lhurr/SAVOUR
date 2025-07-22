import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('Database', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates supabase client with correct config', () => {
    const mockClient = {
      from: jest.fn(),
      auth: { signIn: jest.fn() }
    };
    mockCreateClient.mockReturnValue(mockClient as any);

    const supabaseUrl = 'https://test.supabase.co';
    const supabaseKey = 'test-key';
    
    const client = createClient(supabaseUrl, supabaseKey);
    
    expect(mockCreateClient).toHaveBeenCalledWith(supabaseUrl, supabaseKey);
    expect(client).toBe(mockClient);
  });

  it('handles database queries', async () => {
    const mockData = [{ id: 1, name: 'Test' }];
    const mockClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      })
    };
    mockCreateClient.mockReturnValue(mockClient as any);

    const client = createClient('url', 'key');
    const result = await client.from('test').select('*');
    
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });
});
import { renderHook, act } from '@testing-library/react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

jest.mock('expo-location');

const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Permission denied');
        }
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    getLocation();
  }, []);

  return { location, loading, error };
};

describe('useLocation Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns location when permission granted', async () => {
    const mockLocation = {
      coords: { latitude: 37.7749, longitude: -122.4194 }
    };

    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted'
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

    const { result } = renderHook(() => useLocation());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.location).toEqual(mockLocation);
    expect(result.current.error).toBeNull();
  });

  it('handles permission denied', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied'
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.location).toBeNull();
    expect(result.current.error).toEqual(new Error('Permission denied'));
  });
});
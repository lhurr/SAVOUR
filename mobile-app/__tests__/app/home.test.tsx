import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';

const HomeScreen = () => (
  <View testID="home-screen">
    <Text>Welcome to Home</Text>
  </View>
);

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

describe('HomeScreen', () => {
  it('renders home screen correctly', () => {
    const { getByTestId, getByText } = render(<HomeScreen />);
    
    expect(getByTestId('home-screen')).toBeTruthy();
    expect(getByText('Welcome to Home')).toBeTruthy();
  });
});
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';

const Button = ({ title, onPress }: { title: string; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} testID="button">
    <Text>{title}</Text>
  </TouchableOpacity>
);

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(<Button title="Test Button" onPress={mockOnPress} />);
    
    fireEvent.press(getByTestId('button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

describe('Sample Test', () => {
  it('renders a text element', () => {
    const { getByText } = render(<Text>Hello, Lambo!</Text>);
    expect(getByText('Hello, Lambo!')).toBeTruthy();
  });
}); 
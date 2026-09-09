import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ListingCard } from '../../src/components/ListingCard';
import { MOCK_LISTINGS } from '../../src/types/listing';

describe('ListingCard', () => {
  it('shows rent price and handles press', () => {
    const rent = MOCK_LISTINGS.find((l) => l.mode === 'rent')!;
    const onPress = jest.fn();
    const { getByLabelText, getByText } = render(
      <ListingCard listing={rent} onPress={onPress} />,
    );

    expect(getByText(`$${rent.pricePerDay} / day`)).toBeTruthy();
    fireEvent.press(getByLabelText(rent.title));
    expect(onPress).toHaveBeenCalled();
  });

  it('shows buy price for sale listings', () => {
    const buy = MOCK_LISTINGS.find((l) => l.mode === 'buy')!;
    const { getByText } = render(<ListingCard listing={buy} />);
    expect(getByText(`$${buy.buyPrice}`)).toBeTruthy();
  });
});

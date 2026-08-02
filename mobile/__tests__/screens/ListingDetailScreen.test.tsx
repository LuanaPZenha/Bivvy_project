import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ListingDetailScreen } from '../../src/screens/ListingDetailScreen';
import { MOCK_LISTINGS } from '../../src/types/listing';

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

function makeProps(listingId: string) {
  return {
    navigation: { goBack: jest.fn() } as never,
    route: { key: 'detail', name: 'ListingDetail' as const, params: { listingId } },
  };
}

function renderDetail(listingId: string) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ListingDetailScreen {...makeProps(listingId)} />
    </SafeAreaProvider>,
  );
}

describe('ListingDetailScreen', () => {
  it('renders mode-aware rent price and coming soon CTA', () => {
    const rent = MOCK_LISTINGS.find((l) => l.mode === 'rent')!;
    const { getByText, getByLabelText } = renderDetail(rent.id);

    expect(getByText(rent.title)).toBeTruthy();
    expect(getByText(`$${rent.pricePerDay} / day`)).toBeTruthy();
    fireEvent.press(getByLabelText('Request rental'));
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('renders buy price for sale listings', () => {
    const buy = MOCK_LISTINGS.find((l) => l.mode === 'buy')!;
    const { getByText, getByLabelText } = renderDetail(buy.id);

    expect(getByText(`$${buy.buyPrice}`)).toBeTruthy();
    expect(getByLabelText('Buy')).toBeTruthy();
  });
});

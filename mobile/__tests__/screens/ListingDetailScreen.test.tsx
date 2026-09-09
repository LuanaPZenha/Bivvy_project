import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ListingDetailScreen } from '../../src/screens/ListingDetailScreen';
import { CartProvider } from '../../src/cart/CartContext';
import { MOCK_LISTINGS } from '../../src/types/listing';
import { fetchListingById } from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  fetchListingById: jest.fn(),
}));

jest.mock('../../src/navigation/useRootNavigation', () => ({
  useRootNavigation: () => ({ navigate: jest.fn() }),
}));

const mockedFetchListingById = fetchListingById as jest.MockedFunction<typeof fetchListingById>;

function renderDetail(listingId: string, navigation = { goBack: jest.fn(), navigate: jest.fn(), getParent: () => ({ setOptions: jest.fn() }) }) {
  const props = {
    navigation: navigation as never,
    route: { key: 'detail', name: 'ListingDetail' as const, params: { listingId } },
  };
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <CartProvider>
        <ListingDetailScreen {...props} />
      </CartProvider>
    </SafeAreaProvider>,
  );
}

describe('ListingDetailScreen', () => {
  beforeEach(() => {
    mockedFetchListingById.mockReset();
  });

  it('renders mode-aware rent price and navigates to BookingRequest', async () => {
    const rent = MOCK_LISTINGS.find((l) => l.mode === 'rent')!;
    mockedFetchListingById.mockResolvedValue(rent);
    const navigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
      getParent: () => ({ setOptions: jest.fn() }),
    };
    const { getByText, getByLabelText } = renderDetail(rent.id, navigation);

    await waitFor(() => expect(getByText(rent.title)).toBeTruthy());
    expect(getByText(`$${rent.pricePerDay} / day`)).toBeTruthy();
    fireEvent.press(getByLabelText('Request rental'));
    expect(navigation.navigate).toHaveBeenCalledWith('BookingRequest', { listingId: rent.id });
  });

  it('renders buy price and cart CTAs for sale listings', async () => {
    const buy = MOCK_LISTINGS.find((l) => l.mode === 'buy')!;
    mockedFetchListingById.mockResolvedValue(buy);
    const { getByText, getByLabelText } = renderDetail(buy.id);

    await waitFor(() => expect(getByText(`$${buy.buyPrice}`)).toBeTruthy());
    expect(getByLabelText('Buy now')).toBeTruthy();
    expect(getByLabelText('Add to cart')).toBeTruthy();
  });

  it('falls back to mock listing when fetch fails', async () => {
    const rent = MOCK_LISTINGS.find((l) => l.mode === 'rent')!;
    mockedFetchListingById.mockRejectedValue(new Error('offline'));
    const { getByText } = renderDetail(rent.id);

    await waitFor(() => expect(getByText(rent.title)).toBeTruthy());
  });
});

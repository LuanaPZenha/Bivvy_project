import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useListings } from '../../src/hooks/useListings';
import { fetchNearYou } from '../../src/services/api';
import { MOCK_LISTINGS } from '../../src/types/listing';

jest.mock('../../src/services/api', () => ({
  fetchNearYou: jest.fn(),
}));

const mockedFetchNearYou = fetchNearYou as jest.MockedFunction<typeof fetchNearYou>;

describe('useListings', () => {
  beforeEach(() => {
    mockedFetchNearYou.mockReset();
  });

  it('loads listings from the API', async () => {
    const rentals = MOCK_LISTINGS.filter((l) => l.mode === 'rent');
    mockedFetchNearYou.mockResolvedValue({ count: rentals.length, listings: rentals });

    const { result } = renderHook(() => useListings('all', 'rent'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.usingFallback).toBe(false);
    expect(result.current.count).toBe(rentals.length);
    expect(mockedFetchNearYou).toHaveBeenCalled();
  });

  it('falls back to MOCK_LISTINGS when offline', async () => {
    mockedFetchNearYou.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useListings('all', 'rent'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.usingFallback).toBe(true);
    expect(result.current.count).toBeGreaterThan(0);
    expect(result.current.listings.every((l) => l.mode === 'rent')).toBe(true);
  });

  it('filters fallback listings by category and mode', async () => {
    mockedFetchNearYou.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useListings('all', 'rent'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setCategory('hiking');
    });
    await waitFor(() =>
      expect(result.current.listings.every((l) => l.category === 'hiking')).toBe(true),
    );

    act(() => {
      result.current.setMode('buy');
    });
    await waitFor(() =>
      expect(result.current.listings.every((l) => l.mode === 'buy')).toBe(true),
    );
  });

  it('filters fallback listings by search query', async () => {
    mockedFetchNearYou.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useListings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setQuery('Tent');
    });
    await waitFor(() =>
      expect(result.current.listings.every((l) => l.title.includes('Tent'))).toBe(true),
    );
  });
});

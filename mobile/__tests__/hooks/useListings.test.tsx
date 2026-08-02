import { renderHook, act } from '@testing-library/react-native';
import { useListings } from '../../src/hooks/useListings';

describe('useListings', () => {
  it('filters by category', () => {
    const { result } = renderHook(() => useListings('all'));
    expect(result.current.count).toBeGreaterThan(0);

    act(() => {
      result.current.setCategory('backpacks');
    });

    expect(result.current.listings.every((l) => l.category === 'backpacks')).toBe(true);
  });

  it('filters by search query', () => {
    const { result } = renderHook(() => useListings());

    act(() => {
      result.current.setQuery('Tent');
    });

    expect(result.current.listings.every((l) => l.title.includes('Tent'))).toBe(true);
  });
});

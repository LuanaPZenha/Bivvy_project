'use strict';

const { ListNearYou } = require('../../../src/application/use-cases/ListNearYou');
const {
  InMemoryListingRepository,
} = require('../../../src/infrastructure/persistence/InMemoryListingRepository');

describe('ListNearYou use case', () => {
  it('returns nearby listings', async () => {
    const useCase = new ListNearYou({ listingRepository: new InMemoryListingRepository() });
    const result = await useCase.execute({ category: 'all' });
    expect(result.count).toBeGreaterThan(0);
    expect(result.listings[0].title).toBeDefined();
  });

  it('filters by category', async () => {
    const useCase = new ListNearYou({ listingRepository: new InMemoryListingRepository() });
    const result = await useCase.execute({ category: 'hiking' });
    expect(result.listings.every((l) => l.category === 'hiking')).toBe(true);
    expect(result.count).toBeGreaterThan(0);
  });

  it('filters by mode and query', async () => {
    const useCase = new ListNearYou({ listingRepository: new InMemoryListingRepository() });
    const result = await useCase.execute({ mode: 'rent', query: 'tent' });
    expect(result.listings.every((l) => l.mode === 'rent')).toBe(true);
    expect(result.listings.every((l) => l.title.toLowerCase().includes('tent'))).toBe(true);
  });
});

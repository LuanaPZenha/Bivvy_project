'use strict';

const { ListNearYou } = require('../../../src/application/use-cases/ListNearYou');
const {
  InMemoryListingRepository,
} = require('../../../src/infrastructure/persistence/InMemoryListingRepository');

describe('ListNearYou use case', () => {
  it('returns nearby listings', async () => {
    const useCase = new ListNearYou({
      listingRepository: new InMemoryListingRepository(),
    });
    const result = await useCase.execute({ category: 'all' });
    expect(result.count).toBeGreaterThan(0);
    expect(result.listings[0].title).toBeDefined();
  });

  it('filters by category', async () => {
    const useCase = new ListNearYou({
      listingRepository: new InMemoryListingRepository(),
    });
    const result = await useCase.execute({ category: 'backpacks' });
    expect(result.listings.every((l) => l.category === 'backpacks')).toBe(true);
  });
});

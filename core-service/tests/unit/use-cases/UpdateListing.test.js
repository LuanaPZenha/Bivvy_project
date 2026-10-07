'use strict';

const { UpdateListing } = require('../../../src/application/use-cases/UpdateListing');
const { DeleteListing } = require('../../../src/application/use-cases/DeleteListing');
const {
  InMemoryListingRepository,
} = require('../../../src/infrastructure/persistence/InMemoryListingRepository');
const { CreateListing } = require('../../../src/application/use-cases/CreateListing');

describe('UpdateListing / DeleteListing', () => {
  it('updates title and price for the owner', async () => {
    const listingRepository = new InMemoryListingRepository([]);
    const created = await new CreateListing({ listingRepository }).execute(
      { title: 'Old', category: 'camping', mode: 'rent', pricePerDay: 10 },
      { userId: 'owner_1', name: 'Owner' },
    );
    const updated = await new UpdateListing({ listingRepository }).execute(
      created.id,
      { title: 'New', pricePerDay: 15 },
      { userId: 'owner_1' },
    );
    expect(updated.title).toBe('New');
    expect(updated.pricePerDay).toBe(15);
  });

  it('deletes an owned listing', async () => {
    const listingRepository = new InMemoryListingRepository([]);
    const created = await new CreateListing({ listingRepository }).execute(
      { title: 'Gone', category: 'camping', mode: 'rent', pricePerDay: 10 },
      { userId: 'owner_1', name: 'Owner' },
    );
    const result = await new DeleteListing({
      listingRepository,
      imageStore: { deleteFile: async () => {} },
    }).execute(created.id, { userId: 'owner_1' });
    expect(result.deleted).toBe(true);
    expect(await listingRepository.findById(created.id)).toBeNull();
  });
});

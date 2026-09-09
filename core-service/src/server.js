'use strict';

const path = require('path');
const { createApp } = require('./app');
const { createCoreRepositories } = require('./infrastructure/persistence/createRepositories');
const { LocalImageStore } = require('./infrastructure/storage/LocalImageStore');
const { seedDemoListingImages } = require('./infrastructure/storage/seedDemoImages');

async function main() {
  const port = Number(process.env.PORT) || 3002;
  const repos = await createCoreRepositories();
  const imageStore = new LocalImageStore({
    rootDir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
  });
  const app = createApp({
    listingRepository: repos.listingRepository,
    bookingRepository: repos.bookingRepository,
    imageStore,
    skipDemoImages: true,
  });
  await seedDemoListingImages({
    listingRepository: repos.listingRepository,
    imageStore,
  });
  app.listen(port, () => {
    console.log(`Bivvy Core Service listening on :${port} (persistence=${repos.persistence})`);
  });
}

main().catch((err) => {
  console.error('[core-service] failed to start', err);
  process.exit(1);
});

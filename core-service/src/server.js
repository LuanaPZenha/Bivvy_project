'use strict';

const { createApp } = require('./app');
const { createCoreRepositories } = require('./infrastructure/persistence/createRepositories');

async function main() {
  const port = Number(process.env.PORT) || 3002;
  const repos = await createCoreRepositories();
  const app = createApp({
    listingRepository: repos.listingRepository,
    bookingRepository: repos.bookingRepository,
  });
  app.listen(port, () => {
    console.log(`Bivvy Core Service listening on :${port} (persistence=${repos.persistence})`);
  });
}

main().catch((err) => {
  console.error('[core-service] failed to start', err);
  process.exit(1);
});

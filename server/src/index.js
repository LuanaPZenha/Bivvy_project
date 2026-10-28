'use strict';

const config = require('./config');
const { bootstrapApp } = require('./app');

async function main() {
  config.assertProductionConfig(config);
  const app = await bootstrapApp();
  app.listen(config.port, () => {
    console.log(`[bivvy] server listening on :${config.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

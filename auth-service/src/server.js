'use strict';

const { createApp } = require('./app');

const port = Number(process.env.PORT) || 3001;
const app = createApp();

app.locals.ready
  .then(() => {
    app.listen(port, () => {
      const store = process.env.DATABASE_URL ? 'postgres' : 'in-memory';
      console.log(`Bivvy Auth Service listening on :${port} (${store} users)`);
    });
  })
  .catch((err) => {
    console.error(`Auth service failed to start: ${err.message}`);
    process.exit(1);
  });

'use strict';

const { createApp } = require('./app');

const port = Number(process.env.PORT) || 3001;
const app = createApp();

app.listen(port, () => {
  console.log(`Bivvy Auth Service listening on :${port}`);
});

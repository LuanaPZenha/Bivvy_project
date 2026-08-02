'use strict';

const { createApp } = require('./app');

const port = Number(process.env.PORT) || 3002;
const app = createApp();

app.listen(port, () => {
  console.log(`Bivvy Core Service listening on :${port}`);
});

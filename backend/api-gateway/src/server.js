'use strict';

const { createApp } = require('./app');
const config = require('./config');

const app = createApp();

app.listen(config.port, () => {
  console.log(`Bivvy API Gateway listening on :${config.port}`);
});

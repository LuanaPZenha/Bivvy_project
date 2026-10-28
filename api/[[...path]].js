'use strict';

const config = require('../server/src/config');
const { createApp } = require('../server/src/app');

config.assertProductionConfig(config);

module.exports = createApp({ seedOnRequest: true });

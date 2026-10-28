'use strict';

const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'web');
const dest = path.join(__dirname, '..', 'public');

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, {
  recursive: true,
  filter(source) {
    return path.basename(source) !== 'package.json';
  },
});

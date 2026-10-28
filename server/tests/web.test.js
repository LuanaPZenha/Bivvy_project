'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { pathToFileURL } = require('url');

describe('browser helpers', () => {
  it('escapes HTML metacharacters', async () => {
    const mod = await import(pathToFileURL(path.join(__dirname, '../../web/src/lib/escape.js')).href);
    assert.equal(mod.escapeHtml(`<img alt="x" onerror='alert(1)'>`), '&lt;img alt=&quot;x&quot; onerror=&#39;alert(1)&#39;&gt;');
  });

  it('formats sub-tenth mile distances', async () => {
    const mod = await import(pathToFileURL(path.join(__dirname, '../../web/src/lib/store.js')).href);
    assert.equal(mod.formatMiles(0), '< 0.1 mi');
    assert.equal(mod.priceLabel({ mode: 'rent', pricePerDay: 18 }), '$18 / day');
    assert.equal(mod.priceLabel({ mode: 'buy', buyPrice: 65 }), '$65');
  });
});

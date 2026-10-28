'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../../src/app');

describe('Vercel hosting', () => {
  it('trusts one proxy hop only on Vercel or when TRUST_PROXY=true', () => {
    const previousVercel = process.env.VERCEL;
    const previousTrust = process.env.TRUST_PROXY;
    try {
      process.env.VERCEL = '1';
      delete process.env.TRUST_PROXY;
      assert.equal(createApp().get('trust proxy'), 1);

      delete process.env.VERCEL;
      delete process.env.TRUST_PROXY;
      assert.equal(createApp().get('trust proxy'), false);

      process.env.TRUST_PROXY = 'true';
      assert.equal(createApp().get('trust proxy'), 1);
    } finally {
      if (previousVercel === undefined) delete process.env.VERCEL;
      else process.env.VERCEL = previousVercel;
      if (previousTrust === undefined) delete process.env.TRUST_PROXY;
      else process.env.TRUST_PROXY = previousTrust;
    }
  });

  it('serves health on the API path used by the Vercel rewrite', async () => {
    const app = createApp();
    const server = await new Promise((resolve) => {
      const httpServer = app.listen(0, '127.0.0.1', () => resolve(httpServer));
    });
    try {
      const { port } = server.address();
      const res = await fetch(`http://127.0.0.1:${port}/api/health`);
      const json = await res.json();
      assert.equal(res.status, 200);
      assert.equal(json.status, 'ok');
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('seeds the demo account on the first request', async () => {
    const app = createApp({ seedOnRequest: true });
    const server = await new Promise((resolve) => {
      const httpServer = app.listen(0, '127.0.0.1', () => resolve(httpServer));
    });
    try {
      const { port } = server.address();
      const res = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@bivvy.test', password: 'BivvyDemo123' }),
      });
      const json = await res.json();
      assert.equal(res.status, 200);
      assert.equal(typeof json.accessToken, 'string');
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});

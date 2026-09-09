'use strict';

const { OAuth2Client } = require('google-auth-library');

class GoogleIdTokenVerifier {
  /**
   * @param {{ clientId?: string, client?: { verifyIdToken: Function } }} [opts]
   */
  constructor({ clientId = process.env.GOOGLE_CLIENT_ID, client } = {}) {
    this.clientId = clientId;
    this.client = client || (clientId ? new OAuth2Client(clientId) : null);
  }

  /**
   * @param {string} idToken
   * @returns {Promise<{ email: string, emailVerified: boolean, name: string, sub: string }>}
   */
  async verify(idToken) {
    if (!idToken || typeof idToken !== 'string') {
      const err = new Error('Google ID token required');
      err.status = 400;
      throw err;
    }
    if (!this.client || !this.clientId) {
      const err = new Error('Google sign-in is not configured');
      err.status = 503;
      throw err;
    }

    let ticket;
    try {
      ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });
    } catch {
      const err = new Error('Invalid Google ID token');
      err.status = 401;
      throw err;
    }

    const payload = ticket.getPayload();
    if (!payload?.email) {
      const err = new Error('Google account email is required');
      err.status = 401;
      throw err;
    }
    if (payload.email_verified === false) {
      const err = new Error('Google email is not verified');
      err.status = 401;
      throw err;
    }

    return {
      email: String(payload.email).toLowerCase(),
      emailVerified: Boolean(payload.email_verified),
      name: payload.name || String(payload.email).split('@')[0],
      sub: payload.sub,
    };
  }
}

module.exports = { GoogleIdTokenVerifier };

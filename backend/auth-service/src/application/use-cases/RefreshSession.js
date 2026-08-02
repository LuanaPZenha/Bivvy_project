'use strict';

class RefreshSession {
  constructor({ tokenService }) {
    this.tokenService = tokenService;
  }

  async execute({ refreshToken }) {
    if (!refreshToken) {
      const err = new Error('Refresh token required');
      err.status = 400;
      throw err;
    }
    return this.tokenService.rotate(refreshToken);
  }
}

module.exports = { RefreshSession };

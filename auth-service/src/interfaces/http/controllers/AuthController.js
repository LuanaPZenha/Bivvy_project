'use strict';

class AuthController {
  constructor({ registerUser, loginUser, refreshSession, loginWithGoogle }) {
    this.registerUser = registerUser;
    this.loginUser = loginUser;
    this.refreshSession = refreshSession;
    this.loginWithGoogle = loginWithGoogle;
  }

  register = async (req, res, next) => {
    try {
      const result = await this.registerUser.execute(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.loginUser.execute(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  google = async (req, res, next) => {
    try {
      const result = await this.loginWithGoogle.execute(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const result = await this.refreshSession.execute(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { AuthController };

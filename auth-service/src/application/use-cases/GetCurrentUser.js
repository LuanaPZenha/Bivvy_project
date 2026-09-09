'use strict';

class GetCurrentUser {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute({ userId }) {
    if (!userId) {
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }
    const user = await this.userRepository.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return { user: user.toPublic() };
  }
}

module.exports = { GetCurrentUser };

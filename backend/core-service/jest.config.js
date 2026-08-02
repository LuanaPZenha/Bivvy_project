module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  clearMocks: true,
  collectCoverageFrom: ['src/application/**/*.js', 'src/domain/**/*.js', 'src/interfaces/**/*.js'],
};

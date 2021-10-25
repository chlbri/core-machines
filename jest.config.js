module.exports = {
  preset: 'ts-jest',
  testPathIgnorePatterns: ['./dist'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended/all'],
};

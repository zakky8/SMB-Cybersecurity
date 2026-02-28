// globalSetup — runs once before all test suites
module.exports = async function () {
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  process.env.NODE_ENV = 'test';
};

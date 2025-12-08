const path = require('path');

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["./src/tests/env.setup.ts"],
  setupFilesAfterEnv: ["./src/tests/setup.ts"],
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^@gsimulados/shared$": "<rootDir>/../../packages/shared/src/index.ts"
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { isolatedModules: true }]
  }
};

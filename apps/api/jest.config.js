const path = require('path');

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["./src/tests/env.setup.ts"],
  setupFilesAfterEnv: ["./src/tests/setup.ts"],
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^@gsimulados/shared$": "<rootDir>/../../packages/shared/src/index.ts",
    "^pdf-img-convert$": "<rootDir>/src/tests/mocks/pdf-img-convert.js"
  },
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", { isolatedModules: true }],
    "^.+\\.mjs$": ["ts-jest", { isolatedModules: true }]
  },
  transformIgnorePatterns: [
    "node_modules/(?!(pdf-img-convert|node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill|pdfjs-dist)/)"
  ]
};

const path = require("path")

module.exports = {
  mapCoverage: true,

  rootDir: path.resolve(__dirname, "../"),
  moduleFileExtensions: [
    "js",
    "ts",
    "json"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(js?|ts?)$",
  transform: {
    "^.+\\.ts$": "<rootDir>/node_modules/ts-jest",
    "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
  },
  snapshotSerializers: ["<rootDir>/test/test-utils/jest-serializer.js"],
  setupFiles: ["<rootDir>/test/setup"],
  mapCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!src/main.ts",
    "!**/node_modules/**"
  ]
}

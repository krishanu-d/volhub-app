module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|@react-navigation|react-redux|@reduxjs|immer|redux|redux-thunk|reselect|react-native-mmkv|@notifee|@react-native-firebase)/)',
  ],
};

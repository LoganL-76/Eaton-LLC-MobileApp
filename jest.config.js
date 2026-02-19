module.exports = {
  preset: "jest-expo",
  testMatch: ["**/__tests__/**/*.test.(js|jsx|ts|tsx)"],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?|expo-router|@react-navigation|react-navigation)",
  ],
};

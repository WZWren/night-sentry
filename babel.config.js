module.exports = function(api) {
  api.cache(true);
  return {
    presets: [['@babel/preset-env', {targets: {node: 'current'}}], 'babel-preset-expo'],
    plugins: [
      require.resolve("expo-router/babel"),
      "module:react-native-dotenv",
      "react-native-reanimated/plugin",
    ],
  };
};

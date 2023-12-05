const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
module.exports = mergeConfig(getDefaultConfig(__dirname), {
    server: {
      port: 1006, // Change the port number to your desired value
    },
});
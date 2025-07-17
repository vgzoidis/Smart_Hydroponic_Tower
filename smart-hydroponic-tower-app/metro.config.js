const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    minifierConfig: {
      // Suppress some warnings
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

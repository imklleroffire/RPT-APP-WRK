const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Firebase compatibility fixes
defaultConfig.resolver.sourceExts.push('cjs');

module.exports = defaultConfig; 
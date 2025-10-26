const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add TypeScript path alias support to Metro bundler
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname, 'src'),
};

// Ensure TypeScript files are resolved properly
config.resolver.sourceExts = [
  'ts',
  'tsx',
  'jsx',
  'js',
  'json',
  'mjs',
];

module.exports = config;

// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'], // Remove '^@env$' from here
    rules: { 
      "react/no-unescaped-entities": 0,
      'import/no-unresolved': ['error', { 
        ignore: ['^@env$'] 
      }]
    },
  },
]);
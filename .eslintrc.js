module.exports = {
  env: {
    browser: false,
    es6: true,
    jest: true,
    node: true, // Ensure Node.js globals like `process`, `Buffer`, etc., are recognized
  },
  extends: [
    'airbnb-base',
    'plugin:jest/all',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    // Add Node.js globals that might be used in your project
    process: 'readonly',
    fs: 'readonly',
    Promise: 'readonly', // Ensure `Promise` is globally defined
  },
  parserOptions: {
    ecmaVersion: 2020,  // Support for modern ECMAScript features
    sourceType: 'module', // Support for 'import' and 'export'
  },
  plugins: ['jest'],
  rules: {
    'max-classes-per-file': 'off',
    'no-underscore-dangle': 'off',
    'no-console': 'off',
    'no-shadow': 'off',
    'no-restricted-syntax': [
      'error',
      'LabeledStatement',
      'WithStatement',
    ],
    // Optionally, configure how unused variables are handled
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Ignore unused variables with an underscore
  },
  overrides: [
    {
      files: ['*.js'],
      excludedFiles: 'babel.config.js', // Exclude Babel config file if necessary
    }
  ]
};


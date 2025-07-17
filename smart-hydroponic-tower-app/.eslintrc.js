module.exports = {
  root: true,
  extends: ['@react-native'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
        'prettier/prettier': [
          'error',
          {
            endOfLine: 'auto',
          },
        ],
      },
    },
  ],
  rules: {
    // Disable some rules that conflict with React Native
    'no-console': 'warn',
    'react-native/no-inline-styles': 'off',
    'react/no-unstable-nested-components': 'off',
    // Suppress warnings about global variables that exist in React Native
    'no-undef': 'off',
  },
  globals: {
    __DEV__: true,
    fetch: true,
    RequestInfo: true,
    RequestInit: true,
    Response: true,
  },
};

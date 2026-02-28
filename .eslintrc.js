module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'no-console': 'off',
  },
  overrides: [
    {
      files: ['apps/dashboard/**/*.tsx', 'apps/dashboard/**/*.ts'],
      env: {
        browser: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.next/',
    'coverage/',
    '*.js',
    'apps/agent-mac/',
    'apps/agent-windows/',
  ],
};

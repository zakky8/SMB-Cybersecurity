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
    '@typescript-eslint/no-require-imports': 'off',
    'no-console': 'off',
  },
  // Dashboard has its own ESLint config (.eslintrc in apps/dashboard)
  // Rust agents are excluded entirely
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.next/',
    'coverage/',
    'apps/dashboard/',
    'apps/agent-mac/',
    'apps/agent-windows/',
    '*.config.js',
    'postcss.config.js',
  ],
};

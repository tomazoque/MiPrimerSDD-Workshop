const globals = Object.fromEntries([
  'console', 'process', 'document', 'window', 'URL', 'Storage',
].map(name => [name, 'readonly']));

export default [
  { ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**', 'test-results/**', 'playwright-report/**'] },
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals },
    rules: { 'no-undef': 'error', 'no-unused-vars': 'error', 'eqeqeq': 'error', 'no-unreachable': 'error', 'no-var': 'error' },
  },
  {
    files: ['src/ui/**/*.js'],
    rules: { 'no-restricted-imports': ['error', { patterns: ['**/persistence/**'] }] },
  },
  {
    files: ['src/ui/**/*.js', 'src/logic/**/*.js'],
    rules: {
      'no-restricted-globals': ['error', 'localStorage', 'sessionStorage', 'indexedDB'],
      'no-restricted-properties': ['error',
        ...['window', 'globalThis'].flatMap(object => ['localStorage', 'sessionStorage', 'indexedDB'].map(property => ({ object, property, message: 'Storage belongs in persistence.' }))),
      ],
    },
  },
];

module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:react/recommended', // Ajout du plugin React
    'plugin:jsx-a11y/recommended', // Ajout du plugin pour l'accessibilité
  ],
  plugins: ['@typescript-eslint', 'prettier', 'import', 'react', 'jsx-a11y'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'import/order': [
      'error',
      {
        'groups': [['builtin', 'external', 'internal']],
        'pathGroups': [
          {
            'pattern': 'react',
            'group': 'external',
            'position': 'before',
          },
        ],
        'pathGroupsExcludedImportTypes': ['react'],
        'newlines-between': 'always',
        'alphabetize': { 'order': 'asc', 'caseInsensitive': true },
      },
    ],
    'react/prop-types': 'off', // Désactiver si vous utilisez TypeScript pour les types
    'jsx-a11y/anchor-is-valid': 'off', // Désactiver si vous utilisez Next.js Link
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
}
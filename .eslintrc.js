module.exports = {
  extends: [require.resolve('@gpn-prototypes/frontend-configs/.eslintrc.js')],
  rules: {
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-redeclare': ['error'],
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/no-useless-constructor': 'error',
    'no-redeclare': 'off',
    'no-shadow': 'off',
    'no-use-before-define': 'off',
    'no-useless-constructor': 'off',
  },
};

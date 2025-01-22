/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');
module.exports = {
  root: true,
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-essential',
    'plugin:storybook/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
};

module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', next: 'function', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'function' },
    ],
  },
};

module.exports = {
  "extends": "standard",
  "parserOptions": { "ecmaVersion": 2017 },
  "rules": {
    'comma-dangle': ['error', 'always-multiline'],
    'space-before-function-paren': 'off',
    'prefer-const': 'off',
    "no-console": "error",
    "one-var": ["error", {
      "const": "never",
      "let": "consecutive"
    }],
    "semi": ["error", "never"],
    "no-var": "error",
    "indent": ["error", 2, { "SwitchCase": 1 }]
  }
};

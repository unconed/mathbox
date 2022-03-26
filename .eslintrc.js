module.exports = {
  "plugins": ["jasmine"],
  "env": {
    "browser": true,
    "es2021": true,
    "jasmine": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "no-var": "warn",
    "sort-imports": "error",
    "no-unused-vars": [
      1,
      {"argsIgnorePattern": "^_"}
    ],
    "prefer-const": "warn"
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      "parser": "@typescript-eslint/parser",
      "plugins": [
        "@typescript-eslint"
      ],
      "extends": [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
      ]
    }
  ]
};

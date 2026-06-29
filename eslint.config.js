const eslintConfig = require("./packages/config/eslint/eslint.base.js");

module.exports = [
  ...eslintConfig,
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/build/**", "**/.next/**"],
  }
];

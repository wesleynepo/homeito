import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
    },
  },
  {
    files: ["client/src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      react,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "no-restricted-syntax": ["error", {
        "selector": "JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression",
        "message": "Avoid inline style objects. Use CSS modules for static styles, or cssVars() for CSS custom properties."
      }],
    },
    settings: {
      react: { version: "detect" },
    },
  },
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/*.js"],
  }
);

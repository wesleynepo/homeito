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
      "react/forbid-dom-props": ["error", {
        "forbid": [{ "propName": "style", "message": "Use CSS modules instead of inline styles. For dynamic values, use CSS custom properties and add an eslint-disable comment explaining why." }]
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

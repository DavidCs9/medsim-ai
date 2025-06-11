import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import globals from "globals";

export default defineConfig([
  // Base configuration for all files
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    extends: [js.configs.recommended],
  },

  // Serverless ts api configuration
  {
    files: ["packages/backend-api/**/*.{ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 2022,
      sourceType: "module",
    },
    extends: [js.configs.recommended],
  },

  // TypeScript configuration
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    extends: [...tseslint.configs.recommended],
  },

  // React frontend configuration
  {
    files: ["packages/frontend/**/*.{js,jsx,ts,tsx}"],
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      react: pluginReact,
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      pluginReact.configs.flat.recommended,
    ],
    rules: {
      "react/react-in-jsx-scope": "off", // Not needed with React 17+
    },
  },
]);

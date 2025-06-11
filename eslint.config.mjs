import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

export default defineConfig({
  files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  settings: {
    react: {
      version: 'detect',
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
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
  },
});

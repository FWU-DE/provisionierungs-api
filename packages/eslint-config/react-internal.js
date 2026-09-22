import eslintReact from '@eslint-react/eslint-plugin';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { config as baseConfig } from './base.js';

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import("eslint").Linter.Config[]} */
export const config = tseslint.config([
  baseConfig,
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  eslintReact.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
]);

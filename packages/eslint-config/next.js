import eslintReact from '@eslint-react/eslint-plugin';
import js from '@eslint/js';
import pluginNext from '@next/eslint-plugin-next';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { config as baseConfig } from './base.js';

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nextJsConfig = tseslint.config([
  baseConfig,
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    ...eslintReact.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      '@next/next': pluginNext,
      '@stylistic': stylistic,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
    },
  },
  { rules: { 'no-unused-vars': 'off', '@typescript-eslint/no-unused-vars': 'error' } },
  { ignores: ['.next/**', 'next-env.d.ts', '**/*/graphql-env.d.ts', 'postcss.config.mjs'] },
]);

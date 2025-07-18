import js from '@eslint/js'
import ts from 'typescript-eslint'
import besties from '@besties/eslint-config'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import svelte from 'eslint-plugin-svelte'
import prettier from 'eslint-config-prettier'
import svelteConfig from './svelte.config.js'

export default defineConfig([
	globalIgnores([
		'**/.DS_Store',
		'**/node_modules',
		'build',
		'.svelte-kit',
		'package',
		'**/.env',
		'**/.env.*',
		'!**/.env.example',
		'**/pnpm-lock.yaml',
		'**/package-lock.json',
		'**/yarn.lock'
	]),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...besties.configs.svelte,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'], // Add support for additional file extensions, such as .svelte
				parser: ts.parser,

				svelteConfig
			}
		}
	}
])

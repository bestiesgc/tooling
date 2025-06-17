import js from '@eslint/js'
import ts from 'typescript-eslint'
import besties from '@besties/eslint-config'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import prettier from 'eslint-config-prettier'

export default defineConfig([
	globalIgnores([
		'**/.DS_Store',
		'**/node_modules',
		'build',
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
	prettier,
	...besties.configs.ts,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	}
])

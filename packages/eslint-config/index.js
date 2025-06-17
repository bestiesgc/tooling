const { name, version } = require('./package.json')

const baseConfig = [
	{
		rules: {
			'no-var': 'error',
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'prefer-const': 'error',
			'quotes': ['error', 'single', { avoidEscape: true }],
			'quote-props': ['error', 'as-needed'],
			'no-constant-condition': ['error', { checkLoops: false }],
			'no-duplicate-imports': 'error',
			'no-inner-declarations': 'off'
		}
	}
]

const tsConfig = [
	...baseConfig,
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-empty-object-type': [
				'error',
				{
					allowInterfaces: 'with-single-extends'
				}
			]
		}
	}
]

const svelteConfig = [
	...tsConfig,
	{
		rules: {
			'svelte/block-lang': [
				'error',
				{
					enforceScriptPresent: false,
					enforceStylePresent: false,
					script: 'ts',
					style: 'postcss'
				}
			],
		}
	}
]

module.exports = {
	meta: {
		name,
		version
	},
	configs: {
		js: baseConfig,
		ts: tsConfig,
		svelte: svelteConfig
	}
}
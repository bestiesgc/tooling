module.exports = {
	root: true,
	extends: ['eslint:recommended', 'prettier'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 'latest'
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	rules: {
		'no-var': 'error',
		'prefer-const': 'error',
		quotes: ['error', 'single', { avoidEscape: true }],
		'quote-props': ['error', 'as-needed'],
		'no-constant-condition': ['error', { checkLoops: false }],
		'no-duplicate-imports': 'error',
		'no-inner-declarations': 'off'
	}
}

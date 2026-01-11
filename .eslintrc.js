module.exports = {
	root: true,
	env: {
		browser: false,
		es2021: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: ['./tsconfig.json'],
		tsconfigRootDir: __dirname,
	},
	plugins: ['@typescript-eslint', 'eslint-plugin-n8n-nodes-base'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:eslint-plugin-n8n-nodes-base/community',
		'prettier',
	],
	ignorePatterns: [
		'dist/**/*',
		'node_modules/**/*',
		'.eslintrc.js',
		'jest.config.js',
		'test/**/*',
	],
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		'n8n-nodes-base/node-class-description-icon-not-svg': 'off',
		'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
		'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
	},
};

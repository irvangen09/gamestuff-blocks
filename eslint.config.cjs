/**
 * Project override on top of the default @wordpress/scripts ESLint config.
 *
 * `import/no-unresolved` and `import/no-extraneous-dependencies` are
 * disabled: the ESLint import resolver does not understand the
 * `@wordpress/*` webpack aliasing that `wp-scripts build` uses, so
 * these rules flag every `@wordpress/*` import as unresolved even
 * though the actual build resolves them correctly.
 */
const defaultConfig = require( '@wordpress/scripts/config/eslint.config.cjs' );

module.exports = [
	...defaultConfig,
	{
		rules: {
			'import/no-unresolved': 'off',
			'import/no-extraneous-dependencies': 'off',
		},
	},
];

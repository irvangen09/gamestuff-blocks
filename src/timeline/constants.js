import { __ } from '@wordpress/i18n';

/**
 * Configuration map for supported timeline types.
 *
 * Adding a new variant in the future only requires a new entry here —
 * edit.js and save.js don't need to change.
 */
export const TIMELINE_TYPES = {
	default: {
		tag: 'ul',
		label: __( 'Timeline', 'gamestuff-blocks' ),
	},
	numbered: {
		tag: 'ol',
		label: __( 'Numbered Timeline', 'gamestuff-blocks' ),
	},
};

export const DEFAULT_TIMELINE_TYPE = 'default';

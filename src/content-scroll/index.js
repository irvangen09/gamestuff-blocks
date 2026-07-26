import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';

import Edit from './edit';
import Save from './save';
import deprecated from './deprecated';

import './editor.scss';
import './style.scss';

registerBlockType( metadata, {
	edit: Edit,
	save: Save,
	deprecated,
} );
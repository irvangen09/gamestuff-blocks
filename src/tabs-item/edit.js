import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
} from '@wordpress/block-editor';

const ALLOWED_FORMATS = [ 'core/bold', 'core/italic' ];

/**
 * The label edited here is what the parent "Tabs" block reads (via
 * getBlocks) to build its nav preview and, on the frontend, what
 * TabsRenderer reads to build the actual <button> label. It is not part
 * of this block's own saved markup — see save.js.
 */
export default function Edit( { attributes, setAttributes } ) {
	const { label } = attributes;

	const blockProps = useBlockProps();
	const innerBlocksProps = useInnerBlocksProps( {
		className: 'gsb-tabs-item__content',
	} );

	return (
		<div { ...blockProps }>
			<RichText
				tagName="div"
				style={ { fontWeight: 600, marginBottom: '12px' } }
				value={ label }
				onChange={ ( value ) => setAttributes( { label: value } ) }
				placeholder={ __( 'Tab label…', 'gamestuff-blocks' ) }
				allowedFormats={ ALLOWED_FORMATS }
			/>
			<div { ...innerBlocksProps } />
		</div>
	);
}
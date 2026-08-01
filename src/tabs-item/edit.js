import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
} from '@wordpress/block-editor';

const LABEL_FORMATS = [ 'core/bold', 'core/italic' ];
const CONTENT_TEMPLATE = [ [ 'core/paragraph' ] ];

/**
 * One deliberate difference from the adopted Lunar Core reference:
 * its label disallows all formatting (allowedFormats: []), while ours
 * keeps bold/italic per spec-block-tabs.md §4.
 */
export default function Edit( { attributes, setAttributes } ) {
	const { label } = attributes;

	const blockProps = useBlockProps( {
		className: 'gs-tabs-item',
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'gs-tabs-item__content' },
		{ template: CONTENT_TEMPLATE }
	);

	return (
		<div { ...blockProps }>
			<RichText
				tagName="div"
				className="gs-tabs-item__label"
				placeholder={ __( 'Tab label…', 'gamestuff-blocks' ) }
				value={ label }
				onChange={ ( value ) => setAttributes( { label: value } ) }
				allowedFormats={ LABEL_FORMATS }
			/>
			<div { ...innerBlocksProps } />
		</div>
	);
}

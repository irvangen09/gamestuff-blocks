import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

/**
 * Fully static now — no render.php, no PHP class. The wrapper carries
 * only the "style" variant as a data attribute; view.js reads it at
 * runtime to decide nav orientation and keyboard direction. Nothing
 * about tab/panel roles or IDs is baked in here — see view.js for why.
 */
export default function save( { attributes } ) {
	const { style } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'gs-tabs',
		'data-style': style,
	} );

	const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	return <div { ...innerBlocksProps } />;
}

import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

// Fully static — no render.php/PHP class. Wrapper only carries the
// "style" variant; view.js reads it and owns all tab/panel roles/IDs.
export default function save( { attributes } ) {
	const { style } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'gs-tabs',
		'data-style': style,
	} );

	const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	return <div { ...innerBlocksProps } />;
}

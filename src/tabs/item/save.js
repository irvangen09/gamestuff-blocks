import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
} from '@wordpress/block-editor';

/**
 * Label is a plain <div>, not a <button> — this is what keeps the
 * frontend free of theme-wide button styling (background, uppercase
 * text, etc.). Without JS it's just a heading-like marker above the
 * panel content; view.js relocates it into the tab strip and adds the
 * interactive role/ARIA attributes at runtime.
 */
export default function save( { attributes } ) {
	const { label } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'gs-tabs-item',
	} );

	const innerBlocksProps = useInnerBlocksProps.save( {
		className: 'gs-tabs-item__content',
	} );

	return (
		<div { ...blockProps }>
			<RichText.Content
				tagName="div"
				className="gs-tabs-item__label"
				value={ label }
			/>
			<div { ...innerBlocksProps } />
		</div>
	);
}

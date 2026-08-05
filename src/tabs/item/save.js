import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
} from '@wordpress/block-editor';

// Label is a plain <div>, not a <button> — keeps it free of theme
// button styling; view.js relocates it into the tab strip at runtime.
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

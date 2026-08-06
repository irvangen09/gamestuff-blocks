import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [
	'core/paragraph',
	'core/image',
	'core/buttons',
	'core/list',
];

const CONTENT_TEMPLATE = [ [ 'core/paragraph' ] ];

// rowIndex/columnIndex are written by the parent Table block whenever
// rows/columns change — this block only renders its own content area.
export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'gs-table__cell gs-table__cell--rich',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: CONTENT_TEMPLATE,
	} );

	return <div { ...innerBlocksProps } />;
}
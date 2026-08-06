import { InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { rowIndex, columnIndex } = attributes;

	return (
		<div
			className="gs-table__cell gs-table__cell--rich"
			role="cell"
			style={ {
				gridRow: rowIndex + 1,
				gridColumn: columnIndex + 1,
			} }
		>
			<InnerBlocks.Content />
		</div>
	);
}
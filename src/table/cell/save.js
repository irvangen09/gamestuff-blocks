import { InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { rowId, columnId, rowIndex, columnIndex, rowParity } = attributes;

	return (
		<div
			className="gs-table__cell gs-table__cell--rich"
			role="cell"
			data-row-id={ rowId }
			data-column-id={ columnId }
			data-column-index={ columnIndex }
			data-row-parity={ rowParity }
			style={ {
				// rowIndex already stores the final CSS grid-row line
				// (computed by the parent Table's sync effect), unlike
				// columnIndex which is a plain 0-based array index.
				gridRow: rowIndex,
				gridColumn: columnIndex + 1,
			} }
		>
			<InnerBlocks.Content />
		</div>
	);
}
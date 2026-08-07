import { RichText, InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { preset, columns, rows } = attributes;
	const columnCount = columns.length;

	const blockProps = useBlockProps.save( {
		className: 'gs-table',
		'data-preset': preset,
	} );

	// Precomputed once, outside JSX: each row's grid-row line (offset
	// for the header) and, for data rows only, odd/even parity used
	// for zebra striping (divider rows don't count toward parity).
	let dataRowCount = 0;
	const rowsWithMeta = rows.map( ( row, rowIndex ) => {
		const gridLine = rowIndex + 2;
		if ( row.type === 'data' ) {
			dataRowCount += 1;
		}
		return {
			row,
			gridLine,
			rowParity: dataRowCount % 2 === 0 ? 'even' : 'odd',
		};
	} );

	return (
		<div { ...blockProps }>
			<div
				className="gs-table__grid"
				role="table"
				data-column-count={ columnCount }
				style={ { '--gs-table-columns': columnCount } }
			>
				<div className="gs-table__row gs-table__row--header" role="row">
					{ columns.map( ( column, columnIndex ) => (
						<div
							key={ column.id }
							className={
								'gs-table__col-header' +
								( columnIndex === 0 ? ' gs-table__col-sticky' : '' )
							}
							role="columnheader"
							data-column-id={ column.id }
							data-column-index={ columnIndex }
							data-mobile-primary={
								column.isMobilePrimary ? 'true' : 'false'
							}
							style={ { gridRow: 1, gridColumn: columnIndex + 1 } }
						>
							{ column.label }
						</div>
					) ) }
				</div>

				{ rowsWithMeta.map( ( { row, gridLine, rowParity } ) => {
					if ( row.type === 'group' ) {
						return (
							<div
								key={ row.id }
								className="gs-table__divider"
								role="row"
								data-row-id={ row.id }
								data-default-collapsed={
									row.defaultCollapsed ? 'true' : 'false'
								}
							>
								<div
									className="gs-table__divider-cell"
									role="cell"
									style={ {
										gridRow: gridLine,
										gridColumn: `1 / ${ columnCount + 1 }`,
									} }
								>
									{ row.title }
								</div>
							</div>
						);
					}

					return (
						<div
							key={ row.id }
							className="gs-table__row"
							role="row"
							data-row-id={ row.id }
						>
							{ columns.map( ( column, columnIndex ) => {
								const cell = row.cells?.[ column.id ];

								// richCell content is rendered by its own table-cell
								// child block below, not inline here.
								if ( cell?.mode === 'richCell' ) {
									return null;
								}

								const cellClassName =
									'gs-table__cell' +
									( columnIndex === 0
										? ' gs-table__col-sticky'
										: '' );
								const cellStyle = {
									gridRow: gridLine,
									gridColumn: columnIndex + 1,
								};
								const cellDataProps = {
									'data-column-id': column.id,
									'data-column-index': columnIndex,
									'data-row-parity': rowParity,
								};

								if ( cell?.mode === 'image' ) {
									return (
										<div
											key={ column.id }
											className={ cellClassName }
											role="cell"
											{ ...cellDataProps }
											style={ cellStyle }
										>
											{ cell.imageUrl && (
												<img
													src={ cell.imageUrl }
													alt={ cell.imageAlt || '' }
													className="gs-table__cell-image"
												/>
											) }
										</div>
									);
								}

								return (
									<div
										key={ column.id }
										className={ cellClassName }
										role="cell"
										{ ...cellDataProps }
										style={ cellStyle }
									>
										<RichText.Content
											tagName="span"
											value={ cell?.content || '' }
										/>
									</div>
								);
							} ) }
						</div>
					);
				} ) }

				<InnerBlocks.Content />
			</div>
		</div>
	);
}
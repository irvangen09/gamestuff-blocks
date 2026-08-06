import { RichText, InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { preset, columns, rows } = attributes;
	const columnCount = columns.length;

	const blockProps = useBlockProps.save( {
		className: 'gs-table',
		'data-preset': preset,
	} );

	return (
		<div { ...blockProps }>
			<div
				className="gs-table__grid"
				role="table"
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
							style={ { gridRow: 1, gridColumn: columnIndex + 1 } }
						>
							{ column.label }
						</div>
					) ) }
				</div>

				{ rows.map( ( row, rowIndex ) => {
					// Row 1 is the header; data/group rows start from grid line 2.
					const gridLine = rowIndex + 2;

					if ( row.type === 'group' ) {
						return (
							<div
								key={ row.id }
								className="gs-table__divider"
								role="row"
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
						<div key={ row.id } className="gs-table__row" role="row">
							{ columns.map( ( column, columnIndex ) => {
								const cell = row.cells?.[ column.id ];

								// richCell content is rendered by its own table-cell
								// child block below, not inline here.
								if ( cell?.mode === 'richCell' ) {
									return null;
								}

								return (
									<div
										key={ column.id }
										className={
											'gs-table__cell' +
											( columnIndex === 0
												? ' gs-table__col-sticky'
												: '' )
										}
										role="cell"
										style={ {
											gridRow: gridLine,
											gridColumn: columnIndex + 1,
										} }
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
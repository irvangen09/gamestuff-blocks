import { RichText, useBlockProps } from '@wordpress/block-editor';

// Text cells may contain inline formatting (bold/italic/link) saved
// by RichText; other cell types are always plain values.
function renderCellValue( col, value ) {
	if ( 'text' === col.type ) {
		return <RichText.Content value={ value ?? '' } />;
	}

	return value ?? '';
}

function renderTable( { columns, rows } ) {
	return (
		<table className="gs-table__table">
			<thead>
				<tr>
					{ columns.map( ( col ) => (
						<th
							key={ col.key }
							scope="col"
							data-key={ col.key }
							data-type={ col.type }
						>
							{ col.label }
						</th>
					) ) }
				</tr>
			</thead>
			<tbody>
				{ rows.map( ( row, index ) => {
					if ( row.isDivider ) {
						return (
							<tr
								key={ index }
								className="gs-table__row--divider"
							>
								<td
									colSpan={ columns.length }
									className="gs-table__divider-cell"
								>
									{ row.dividerLabel ?? '' }
								</td>
							</tr>
						);
					}

					return (
						<tr key={ index }>
							{ columns.map( ( col ) => {
								if ( 'image' === col.type ) {
									const image = row[ col.key ];

									return (
										<td
											key={ col.key }
											data-label={ col.label }
											data-key={ col.key }
										>
											{ image?.url && (
												<img
													src={ image.url }
													alt={ image.alt || '' }
													style={ {
														width:
															( col.imageWidth ||
																48 ) + 'px',
														height: 'auto',
													} }
												/>
											) }
										</td>
									);
								}

								return (
									<td
										key={ col.key }
										data-label={ col.label }
										data-key={ col.key }
									>
										{ renderCellValue(
											col,
											row[ col.key ]
										) }
									</td>
								);
							} ) }
						</tr>
					);
				} ) }
			</tbody>
		</table>
	);
}

// Column role is positional: 1 = image, 2 = title, 3 = subtitle,
// 4+ = detail.
function renderCards( { columns, rows } ) {
	const [ imageCol, titleCol, subtitleCol, ...detailCols ] = columns;

	// colSpan can't be columns.length — the heading cell merges two
	// columns, so cellCount is the real <td> count per row.
	const cellCount = ( imageCol ? 1 : 0 ) + 1 + detailCols.length;

	return (
		<table
			className="gs-table__cards"
			data-has-image={ imageCol ? 'true' : 'false' }
		>
			<tbody>
				{ rows.map( ( row, index ) => {
					if ( row.isDivider ) {
						return (
							<tr
								key={ index }
								className="gs-table__row--divider"
							>
								<td
									colSpan={ cellCount }
									className="gs-table__cards-divider-cell"
								>
									{ row.dividerLabel ?? '' }
								</td>
							</tr>
						);
					}

					const image = imageCol ? row[ imageCol.key ] : null;

					return (
						<tr key={ index } className="gs-table__card">
							{ imageCol && (
								<td
									className="gs-table__card-cell-image"
									data-key={ imageCol.key }
								>
									{ image?.url ? (
										<img
											src={ image.url }
											alt={ image.alt || '' }
											className="gs-table__card-image"
										/>
									) : (
										<div
											className="gs-table__card-image-placeholder"
											aria-hidden="true"
										/>
									) }
								</td>
							) }

							<td className="gs-table__card-cell-heading">
								<div className="gs-table__card-title">
									{ titleCol
										? renderCellValue(
												titleCol,
												row[ titleCol.key ]
										  )
										: '' }
								</div>
								{ subtitleCol && (
									<div className="gs-table__card-subtitle">
										{ renderCellValue(
											subtitleCol,
											row[ subtitleCol.key ]
										) }
									</div>
								) }
							</td>

							{ detailCols.map( ( col ) => (
								<td
									key={ col.key }
									className="gs-table__card-cell-detail"
									data-key={ col.key }
								>
									<strong>{ col.label }:</strong>{ ' ' }
									{ renderCellValue( col, row[ col.key ] ) }
								</td>
							) ) }
						</tr>
					);
				} ) }
			</tbody>
		</table>
	);
}

export default function save( { attributes } ) {
	const { preset, columns, rows, enableSort, enableFilter } = attributes;

	if ( ! columns.length ) {
		return null;
	}

	const isCardLayout = 'style-2' === preset;

	const blockProps = useBlockProps.save( {
		className: 'gs-table',
		'data-preset': preset,
		// Sort needs a clickable header, which card layout doesn't have.
		'data-sort': ! isCardLayout && enableSort ? 'true' : 'false',
		'data-filter': enableFilter ? 'true' : 'false',
	} );

	return (
		<div { ...blockProps }>
			{ isCardLayout
				? renderCards( { columns, rows } )
				: renderTable( { columns, rows } ) }
		</div>
	);
}

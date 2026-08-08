import { useBlockProps } from '@wordpress/block-editor';

function renderTable( { columns, rows } ) {
	return (
		<table className="gs-table__table">
			<thead>
				<tr>
					{ columns.map( ( col ) => (
						<th key={ col.key } scope="col" data-key={ col.key } data-type={ col.type }>
							{ col.label }
						</th>
					) ) }
				</tr>
			</thead>
			<tbody>
				{ rows.map( ( row, index ) => {
					if ( row.isDivider ) {
						return (
							<tr key={ index } className="gs-table__row--divider">
								<td colSpan={ columns.length } className="gs-table__divider-cell">
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
										<td key={ col.key } data-label={ col.label } data-key={ col.key }>
											{ image?.url && (
												<img
													src={ image.url }
													alt={ image.alt || '' }
													style={ { width: ( col.imageWidth || 48 ) + 'px', height: 'auto' } }
												/>
											) }
										</td>
									);
								}

								return (
									<td key={ col.key } data-label={ col.label } data-key={ col.key }>
										{ row[ col.key ] ?? '' }
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

// Style 2 ("catalog card"): same columns/rows data, rendered as a
// card grid instead of a table. Column role is positional, not
// user-labeled: column 1 = image, column 2 = title, column 3 =
// subtitle, column 4+ = "label: value" detail lines.
function renderCards( { columns, rows } ) {
	const [ imageCol, titleCol, subtitleCol, ...detailCols ] = columns;

	return (
		<div className="gs-table__cards">
			{ rows.map( ( row, index ) => {
				if ( row.isDivider ) {
					return (
						<div key={ index } className="gs-table__cards-divider">
							{ row.dividerLabel ?? '' }
						</div>
					);
				}

				const image = imageCol ? row[ imageCol.key ] : null;

				return (
					<div key={ index } className="gs-table__card">
						<div className="gs-table__card-head">
							{ image?.url ? (
								<img
									src={ image.url }
									alt={ image.alt || '' }
									className="gs-table__card-image"
								/>
							) : (
								<div className="gs-table__card-image-placeholder" aria-hidden="true" />
							) }

							<div className="gs-table__card-heading">
								<div className="gs-table__card-title">
									{ titleCol ? row[ titleCol.key ] ?? '' : '' }
								</div>
								{ subtitleCol && (
									<div className="gs-table__card-subtitle">
										{ row[ subtitleCol.key ] ?? '' }
									</div>
								) }
							</div>
						</div>

						{ detailCols.length > 0 && (
							<div className="gs-table__card-body">
								{ detailCols.map( ( col ) => (
									<div key={ col.key } className="gs-table__card-detail" data-key={ col.key }>
										<strong>{ col.label }:</strong> { row[ col.key ] ?? '' }
									</div>
								) ) }
							</div>
						) }
					</div>
				);
			} ) }
		</div>
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
			{ isCardLayout ? renderCards( { columns, rows } ) : renderTable( { columns, rows } ) }
		</div>
	);
}
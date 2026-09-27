import { RichText, useBlockProps } from '@wordpress/block-editor';

import { columnAlignStyle, headerAlignStyle } from './utils';

// Text cells may contain inline formatting (bold/italic/link) saved
// by RichText; other cell types are always plain values.
function renderCellValue( col, value ) {
	if ( 'text' === col.type ) {
		return <RichText.Content value={ value ?? '' } />;
	}

	return value ?? '';
}

function renderTable( { columns, rows, preset } ) {
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
							style={ headerAlignStyle( col, preset ) }
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
											style={ columnAlignStyle(
												col,
												preset
											) }
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
										style={ columnAlignStyle(
											col,
											preset
										) }
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

// Column role is positional: 1 = image, 2 = name, 3 = STA/FAT badge(s),
// 4 = price badge, 5+ = labeled fields (Ingredients, Utensils, Source, etc).
function renderRecipeCardA( { columns, rows } ) {
	const [ imageCol, nameCol, statCol, priceCol, ...fieldCols ] = columns;

	// colSpan can't be columns.length — image and everything else merge
	// into two <td>s per row (image cell, main cell), not one per column.
	const cellCount = ( imageCol ? 1 : 0 ) + 1;

	return (
		<table className="gs-table__recipes">
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
									className="gs-table__recipes-divider-cell"
								>
									{ row.dividerLabel ?? '' }
								</td>
							</tr>
						);
					}

					const image = imageCol ? row[ imageCol.key ] : null;

					// A comma splits a badge's raw value into separate
					// chips (e.g. "+6 STA, -20 FAT"); rendered as plain
					// text rather than through renderCellValue, since
					// splitting formatted RichText HTML on a literal
					// comma could cut a tag in half.
					const statChips = statCol
						? ( row[ statCol.key ] ?? '' )
								.split( ',' )
								.map( ( part ) => part.trim() )
								.filter( Boolean )
						: [];

					const priceValue = priceCol ? row[ priceCol.key ] : '';

					return (
						<tr key={ index } className="gs-table__recipe-card">
							{ imageCol && (
								<td
									className="gs-table__recipe-cell-image"
									data-key={ imageCol.key }
								>
									{ image?.url && (
										<img
											src={ image.url }
											alt={ image.alt || '' }
											className="gs-table__recipe-image"
										/>
									) }
								</td>
							) }

							<td className="gs-table__recipe-cell-main">
								<div className="gs-table__recipe-top">
									{ nameCol && (
										<span className="gs-table__recipe-name">
											{ renderCellValue(
												nameCol,
												row[ nameCol.key ]
											) }
										</span>
									) }
									{ ( statChips.length > 0 ||
										priceValue ) && (
										<span className="gs-table__recipe-stats">
											{ statChips.map( ( chip, i ) => (
												<span
													key={ i }
													className="gs-table__recipe-chip gs-table__recipe-chip--accent"
												>
													{ chip }
												</span>
											) ) }
											{ priceValue && (
												<span className="gs-table__recipe-chip">
													{ priceValue }
												</span>
											) }
										</span>
									) }
								</div>

								{ fieldCols.map( ( col ) => {
									const value = row[ col.key ];

									if ( ! value ) {
										return null;
									}

									return (
										<div
											key={ col.key }
											className="gs-table__recipe-field"
										>
											<span className="gs-table__recipe-field-label">
												{ col.label }
											</span>
											<span className="gs-table__recipe-field-value">
												{ renderCellValue(
													col,
													value
												) }
											</span>
										</div>
									);
								} ) }
							</td>
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
	const isRecipeCardA = 'recipe-card-a' === preset;

	const blockProps = useBlockProps.save( {
		className: 'gs-table',
		'data-preset': preset,
		// Sort needs a clickable header, which card layouts don't have.
		'data-sort':
			! isCardLayout && ! isRecipeCardA && enableSort
				? 'true'
				: 'false',
		'data-filter': enableFilter ? 'true' : 'false',
	} );

	let tableMarkup;

	if ( isCardLayout ) {
		tableMarkup = renderCards( { columns, rows } );
	} else if ( isRecipeCardA ) {
		tableMarkup = renderRecipeCardA( { columns, rows } );
	} else {
		tableMarkup = renderTable( { columns, rows, preset } );
	}

	return <div { ...blockProps }>{ tableMarkup }</div>;
}
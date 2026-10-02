import { RichText, useBlockProps } from '@wordpress/block-editor';

const ATTRIBUTES_V1 = {
	preset: {
		type: 'string',
		enum: [ 'standard', 'style-1', 'style-2' ],
		default: 'standard',
	},
	columns: {
		type: 'array',
		default: [
			{ key: 'col-1', label: 'Column 1', type: 'text' },
			{ key: 'col-2', label: 'Column 2', type: 'text' },
		],
	},
	rows: {
		type: 'array',
		default: [
			{ isDivider: false, 'col-1': '', 'col-2': '' },
			{ isDivider: false, 'col-1': '', 'col-2': '' },
		],
	},
	enableSort: {
		type: 'boolean',
		default: true,
	},
	enableFilter: {
		type: 'boolean',
		default: true,
	},
};

const SUPPORTS_V1 = {
	html: false,
	align: [ 'wide', 'full' ],
	spacing: {
		margin: true,
		padding: true,
	},
};

function renderTableV1( { columns, rows } ) {
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

// Column role is positional: 1 = image, 2 = title, 3 = subtitle,
// 4+ = detail.
function renderCardsV1( { columns, rows } ) {
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
								<div
									className="gs-table__card-image-placeholder"
									aria-hidden="true"
								/>
							) }

							<div className="gs-table__card-heading">
								<div className="gs-table__card-title">
									{ titleCol
										? ( row[ titleCol.key ] ?? '' )
										: '' }
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
									<div
										key={ col.key }
										className="gs-table__card-detail"
										data-key={ col.key }
									>
										<strong>{ col.label }:</strong>{ ' ' }
										{ row[ col.key ] ?? '' }
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

function saveV1( { attributes } ) {
	const { preset, columns, rows, enableSort, enableFilter } = attributes;

	if ( ! columns.length ) {
		return null;
	}

	const isCardLayout = 'style-2' === preset;

	const blockProps = useBlockProps.save( {
		className: 'gs-table',
		'data-preset': preset,
		'data-sort': ! isCardLayout && enableSort ? 'true' : 'false',
		'data-filter': enableFilter ? 'true' : 'false',
	} );

	return (
		<div { ...blockProps }>
			{ isCardLayout
				? renderCardsV1( { columns, rows } )
				: renderTableV1( { columns, rows } ) }
		</div>
	);
}

const ATTRIBUTES_V2 = {
	preset: {
		type: 'string',
		enum: [ 'standard', 'style-1', 'style-2', 'plain' ],
		default: 'standard',
	},
	columns: {
		type: 'array',
		default: [],
	},
	rows: {
		type: 'array',
		default: [],
	},
	enableSort: {
		type: 'boolean',
		default: true,
	},
	enableFilter: {
		type: 'boolean',
		default: true,
	},
};

const SUPPORTS_V2 = {
	html: false,
	align: [ 'wide', 'full' ],
	spacing: {
		margin: true,
		padding: true,
	},
};

// Plain's header always centered here, with no per-column default —
// superseded once it started defaulting to left. Column alignment
// (when set) still applied, same as it does for body cells.
function columnAlignStyleV2( col, preset ) {
	if ( 'plain' !== preset || ! col.align ) {
		return undefined;
	}

	return { textAlign: col.align };
}

function renderCellValueV2( col, value ) {
	if ( 'text' === col.type ) {
		return <RichText.Content value={ value ?? '' } />;
	}

	return value ?? '';
}

function renderTableV2( { columns, rows, preset } ) {
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
							style={ columnAlignStyleV2( col, preset ) }
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
											style={ columnAlignStyleV2(
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
										style={ columnAlignStyleV2(
											col,
											preset
										) }
									>
										{ renderCellValueV2(
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
function renderCardsV2( { columns, rows } ) {
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
										? renderCellValueV2(
												titleCol,
												row[ titleCol.key ]
											)
										: '' }
								</div>
								{ subtitleCol && (
									<div className="gs-table__card-subtitle">
										{ renderCellValueV2(
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
									{ renderCellValueV2( col, row[ col.key ] ) }
								</td>
							) ) }
						</tr>
					);
				} ) }
			</tbody>
		</table>
	);
}

function saveV2( { attributes } ) {
	const { preset, columns, rows, enableSort, enableFilter } = attributes;

	if ( ! columns.length ) {
		return null;
	}

	const isCardLayout = 'style-2' === preset;

	const blockProps = useBlockProps.save( {
		className: 'gs-table',
		'data-preset': preset,
		'data-sort': ! isCardLayout && enableSort ? 'true' : 'false',
		'data-filter': enableFilter ? 'true' : 'false',
	} );

	return (
		<div { ...blockProps }>
			{ isCardLayout
				? renderCardsV2( { columns, rows } )
				: renderTableV2( { columns, rows, preset } ) }
		</div>
	);
}

// Attributes are unchanged from the current schema — only the Plain
// header's default alignment differs — so no migrate() is needed.
const v2 = {
	attributes: ATTRIBUTES_V2,
	supports: SUPPORTS_V2,
	save: saveV2,
};

// Attributes are unchanged from the current schema — only markup
// differs — so no migrate() is needed.
const v1 = {
	attributes: ATTRIBUTES_V1,
	supports: SUPPORTS_V1,
	save: saveV1,
};

export default [ v2, v1 ];
import { useBlockProps } from '@wordpress/block-editor';

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

// Style 2 as it existed before the semantic HTML refactor: a plain
// div grid, not a <table>. Column role was positional (1 = image,
// 2 = title, 3 = subtitle, 4+ = detail), same as the current version.
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
										? row[ titleCol.key ] ?? ''
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

// v1: text cells were plain strings (no bold/italic/link formatting),
// and Style 2 ("Catalog Card") rendered as a div grid instead of a
// semantic <table>. Attributes are unchanged — only markup differs —
// so no migrate() is needed; existing saved content keeps validating
// against this exact markup.
const v1 = {
	attributes: ATTRIBUTES_V1,
	supports: SUPPORTS_V1,
	save: saveV1,
};

export default [ v1 ];
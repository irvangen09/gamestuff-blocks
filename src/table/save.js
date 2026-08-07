import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { preset, columns, rows, enableSort, enableFilter } = attributes;

	if ( ! columns.length ) {
		return null;
	}

	const blockProps = useBlockProps.save( {
		className: 'gs-table',
		'data-preset': preset,
		'data-sort': enableSort ? 'true' : 'false',
		'data-filter': enableFilter ? 'true' : 'false',
	} );

	return (
		<div { ...blockProps }>
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
		</div>
	);
}
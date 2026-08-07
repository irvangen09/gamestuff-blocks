import { useMemo, useCallback } from '@wordpress/element';
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	RichText,
	MediaUpload,
	MediaUploadCheck,
	InnerBlocks,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	Button,
	DropdownMenu,
	ToolbarGroup,
	ToolbarButton,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

const PRESET_OPTIONS = [
	{ label: __( 'Standard', 'gamestuff-blocks' ), value: 'standard' },
	{ label: __( 'Compact', 'gamestuff-blocks' ), value: 'compact' },
	{ label: __( 'Comparison', 'gamestuff-blocks' ), value: 'comparison' },
	{ label: __( 'Schedule', 'gamestuff-blocks' ), value: 'schedule' },
	{ label: __( 'Database', 'gamestuff-blocks' ), value: 'database' },
];

let idCounter = 0;
function generateId( prefix ) {
	idCounter += 1;
	return `${ prefix }-${ Date.now().toString( 36 ) }-${ idCounter }`;
}

function emptyCell() {
	return { mode: 'text', content: '' };
}

function emptyColumn() {
	return {
		id: generateId( 'col' ),
		label: __( 'New column', 'gamestuff-blocks' ),
		isMobilePrimary: false,
	};
}

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { preset, columns, rows } = attributes;

	const blockProps = useBlockProps( {
		className: 'gs-table gs-table--is-editing',
	} );

	// --- Column mutations ---

	const addColumn = useCallback(
		( atIndex ) => {
			const newColumn = emptyColumn();
			const newColumns = [ ...columns ];
			newColumns.splice( atIndex, 0, newColumn );

			const newRows = rows.map( ( row ) => {
				if ( row.type !== 'data' ) {
					return row;
				}
				return {
					...row,
					cells: { ...row.cells, [ newColumn.id ]: emptyCell() },
				};
			} );

			setAttributes( { columns: newColumns, rows: newRows } );
		},
		[ columns, rows, setAttributes ]
	);

	const removeColumn = useCallback(
		( columnId ) => {
			const newColumns = columns.filter( ( c ) => c.id !== columnId );
			const newRows = rows.map( ( row ) => {
				if ( row.type !== 'data' ) {
					return row;
				}
				const cells = { ...row.cells };
				delete cells[ columnId ];
				return { ...row, cells };
			} );
			setAttributes( { columns: newColumns, rows: newRows } );
		},
		[ columns, rows, setAttributes ]
	);

	const updateColumnLabel = useCallback(
		( columnId, label ) => {
			setAttributes( {
				columns: columns.map( ( c ) =>
					c.id === columnId ? { ...c, label } : c
				),
			} );
		},
		[ columns, setAttributes ]
	);

	// Only one column may be the mobile-primary attribute at a time.
	const toggleMobilePrimary = useCallback(
		( columnId ) => {
			setAttributes( {
				columns: columns.map( ( c ) => ( {
					...c,
					isMobilePrimary:
						c.id === columnId ? ! c.isMobilePrimary : false,
				} ) ),
			} );
		},
		[ columns, setAttributes ]
	);

	// --- Row mutations ---

	const addDataRow = useCallback(
		( atIndex ) => {
			const cells = {};
			columns.forEach( ( c ) => {
				cells[ c.id ] = emptyCell();
			} );
			const newRow = { type: 'data', id: generateId( 'row' ), cells };
			const newRows = [ ...rows ];
			newRows.splice( atIndex, 0, newRow );
			setAttributes( { rows: newRows } );
		},
		[ columns, rows, setAttributes ]
	);

	const addGroupRow = useCallback(
		( atIndex ) => {
			const newRow = {
				type: 'group',
				id: generateId( 'group' ),
				title: __( 'Group title', 'gamestuff-blocks' ),
				defaultCollapsed: false,
			};
			const newRows = [ ...rows ];
			newRows.splice( atIndex, 0, newRow );
			setAttributes( { rows: newRows } );
		},
		[ rows, setAttributes ]
	);

	const removeRow = useCallback(
		( rowId ) => {
			setAttributes( { rows: rows.filter( ( r ) => r.id !== rowId ) } );
		},
		[ rows, setAttributes ]
	);

	const updateGroupTitle = useCallback(
		( rowId, title ) => {
			setAttributes( {
				rows: rows.map( ( r ) =>
					r.id === rowId ? { ...r, title } : r
				),
			} );
		},
		[ rows, setAttributes ]
	);

	const toggleDefaultCollapsed = useCallback(
		( rowId ) => {
			setAttributes( {
				rows: rows.map( ( r ) =>
					r.id === rowId
						? { ...r, defaultCollapsed: ! r.defaultCollapsed }
						: r
				),
			} );
		},
		[ rows, setAttributes ]
	);

	// --- Cell mutations ---

	const updateCell = useCallback(
		( rowId, columnId, patch ) => {
			setAttributes( {
				rows: rows.map( ( r ) => {
					if ( r.id !== rowId || r.type !== 'data' ) {
						return r;
					}
					return {
						...r,
						cells: {
							...r.cells,
							[ columnId ]: { ...r.cells[ columnId ], ...patch },
						},
					};
				} ),
			} );
		},
		[ rows, setAttributes ]
	);

	// Switching mode resets the cell — text/image/richCell store incompatible shapes.
	const setCellMode = useCallback(
		( rowId, columnId, mode ) => {
			if ( mode === 'text' ) {
				updateCell( rowId, columnId, { mode: 'text', content: '' } );
			} else if ( mode === 'image' ) {
				updateCell( rowId, columnId, {
					mode: 'image',
					imageId: 0,
					imageUrl: '',
					imageAlt: '',
				} );
			} else {
				updateCell( rowId, columnId, { mode: 'richCell' } );
			}
		},
		[ updateCell ]
	);

	// --- Paste from spreadsheet (text cells only) ---

	const handlePaste = useCallback(
		( event, startRowId, startColumnId ) => {
			const text = event.clipboardData?.getData( 'text/plain' );
			if ( ! text || ( ! text.includes( '\t' ) && ! text.includes( '\n' ) ) ) {
				return; // single value — let RichText handle its own paste.
			}
			event.preventDefault();

			const grid = text
				.replace( /\r/g, '' )
				.split( '\n' )
				.filter( ( line ) => line.length > 0 )
				.map( ( line ) => line.split( '\t' ) );

			const startRowIndex = rows.findIndex( ( r ) => r.id === startRowId );
			const startColIndex = columns.findIndex(
				( c ) => c.id === startColumnId
			);
			if ( startRowIndex === -1 || startColIndex === -1 ) {
				return;
			}

			const newColumns = [ ...columns ];
			const neededColumns =
				startColIndex + Math.max( ...grid.map( ( line ) => line.length ) );
			while ( newColumns.length < neededColumns ) {
				newColumns.push( emptyColumn() );
			}

			const newRows = [ ...rows ];
			grid.forEach( ( line, lineOffset ) => {
				const targetRowIndex = startRowIndex + lineOffset;
				let targetRow = newRows[ targetRowIndex ];

				if ( ! targetRow ) {
					const cells = {};
					newColumns.forEach( ( c ) => {
						cells[ c.id ] = emptyCell();
					} );
					targetRow = { type: 'data', id: generateId( 'row' ), cells };
					newRows.push( targetRow );
				}

				if ( targetRow.type !== 'data' ) {
					return;
				}

				const updatedCells = { ...targetRow.cells };
				line.forEach( ( value, colOffset ) => {
					const column = newColumns[ startColIndex + colOffset ];
					if ( ! column ) {
						return;
					}
					const existing = updatedCells[ column.id ];
					if ( existing && existing.mode !== 'text' ) {
						return; // don't overwrite an image/richCell with pasted text.
					}
					updatedCells[ column.id ] = { mode: 'text', content: value };
				} );

				newRows[ targetRowIndex ] = { ...targetRow, cells: updatedCells };
			} );

			setAttributes( { columns: newColumns, rows: newRows } );
		},
		[ rows, columns, setAttributes ]
	);

	// --- Sync table-cell (richCell) child blocks with rows/columns ---

	const innerBlocks = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks( clientId ),
		[ clientId ]
	);
	const { insertBlock, removeBlock, updateBlockAttributes } =
		useDispatch( 'core/block-editor' );

	useMemo( () => {
		const expected = [];
		let gridLine = 2; // line 1 is the header row.
		let dataRowCount = 0;
		rows.forEach( ( row ) => {
			if ( row.type === 'data' ) {
				dataRowCount += 1;
				const rowParity = dataRowCount % 2 === 0 ? 'even' : 'odd';
				columns.forEach( ( column, columnIndex ) => {
					const cell = row.cells?.[ column.id ];
					if ( cell?.mode === 'richCell' ) {
						expected.push( {
							rowId: row.id,
							columnId: column.id,
							rowIndex: gridLine,
							columnIndex,
							rowParity,
						} );
					}
				} );
			}
			gridLine += 1;
		} );

		innerBlocks.forEach( ( block ) => {
			const stillNeeded = expected.some(
				( e ) =>
					e.rowId === block.attributes.rowId &&
					e.columnId === block.attributes.columnId
			);
			if ( ! stillNeeded ) {
				removeBlock( block.clientId, false );
			}
		} );

		expected.forEach( ( e ) => {
			const existing = innerBlocks.find(
				( block ) =>
					block.attributes.rowId === e.rowId &&
					block.attributes.columnId === e.columnId
			);
			if ( existing ) {
				if (
					existing.attributes.rowIndex !== e.rowIndex ||
					existing.attributes.columnIndex !== e.columnIndex ||
					existing.attributes.rowParity !== e.rowParity
				) {
					updateBlockAttributes( existing.clientId, {
						rowIndex: e.rowIndex,
						columnIndex: e.columnIndex,
						rowParity: e.rowParity,
					} );
				}
			} else {
				insertBlock(
					createBlock( 'gamestuff/table-cell', {
						rowId: e.rowId,
						columnId: e.columnId,
						rowIndex: e.rowIndex,
						columnIndex: e.columnIndex,
						rowParity: e.rowParity,
					} ),
					innerBlocks.length,
					clientId,
					false
				);
			}
		} );
		// Sync only reacts to data-shape changes, not to innerBlocks itself
		// (avoids an infinite loop, since this effect writes to innerBlocks).
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ rows, columns ] );

	// --- Cell mode menu (hidden until hover/focus — see editor.scss) ---

	function cellModeMenu( row, column, cell ) {
		return (
			<DropdownMenu
				icon="ellipsis"
				label={ __( 'Cell type', 'gamestuff-blocks' ) }
				className="gs-table__cell-menu"
				controls={ [
					{
						title: __( 'Text', 'gamestuff-blocks' ),
						isDisabled: cell.mode === 'text',
						onClick: () => setCellMode( row.id, column.id, 'text' ),
					},
					{
						title: __( 'Image', 'gamestuff-blocks' ),
						isDisabled: cell.mode === 'image',
						onClick: () => setCellMode( row.id, column.id, 'image' ),
					},
					{
						title: __( 'Rich Cell', 'gamestuff-blocks' ),
						isDisabled: cell.mode === 'richCell',
						onClick: () =>
							setCellMode( row.id, column.id, 'richCell' ),
					},
				] }
			/>
		);
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Table Settings', 'gamestuff-blocks' ) }>
					<SelectControl
						label={ __( 'Preset', 'gamestuff-blocks' ) }
						value={ preset }
						options={ PRESET_OPTIONS }
						onChange={ ( value ) => setAttributes( { preset: value } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton onClick={ () => addDataRow( rows.length ) }>
						{ __( 'Add row', 'gamestuff-blocks' ) }
					</ToolbarButton>
					<ToolbarButton onClick={ () => addColumn( columns.length ) }>
						{ __( 'Add column', 'gamestuff-blocks' ) }
					</ToolbarButton>
					<ToolbarButton onClick={ () => addGroupRow( rows.length ) }>
						{ __( 'Add divider', 'gamestuff-blocks' ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>

			<div { ...blockProps }>
				<div
					className="gs-table__grid gs-table__grid--editor"
					style={ { '--gs-table-columns': columns.length } }
				>
					<div className="gs-table__row gs-table__row--header">
						{ columns.map( ( column, columnIndex ) => (
							<div
								key={ column.id }
								className="gs-table__col-header gs-table__col-header--editable"
							>
								{ columnIndex > 0 && (
									<Button
										className="gs-table__insert-column"
										icon="plus"
										label={ __(
											'Insert column left',
											'gamestuff-blocks'
										) }
										size="small"
										onClick={ () => addColumn( columnIndex ) }
									/>
								) }
								<RichText
									tagName="span"
									className="gs-table__col-header-label"
									value={ column.label }
									onChange={ ( value ) =>
										updateColumnLabel( column.id, value )
									}
									placeholder={ __(
										'Column label',
										'gamestuff-blocks'
									) }
								/>
								{ column.isMobilePrimary && (
									<span className="gs-table__col-badge">
										{ __( 'Mobile primary', 'gamestuff-blocks' ) }
									</span>
								) }
								<DropdownMenu
									icon="ellipsis"
									label={ __(
										'Column options',
										'gamestuff-blocks'
									) }
									className="gs-table__col-menu"
									controls={ [
										{
											title: column.isMobilePrimary
												? __(
														'Unset as mobile primary',
														'gamestuff-blocks'
												  )
												: __(
														'Set as mobile primary',
														'gamestuff-blocks'
												  ),
											onClick: () =>
												toggleMobilePrimary( column.id ),
										},
										columnIndex > 0 && {
											title: __(
												'Remove column',
												'gamestuff-blocks'
											),
											onClick: () =>
												removeColumn( column.id ),
										},
									].filter( Boolean ) }
								/>
							</div>
						) ) }
					</div>

					{ rows.map( ( row, rowIndex ) => {
						if ( row.type === 'group' ) {
							return (
								<div
									key={ row.id }
									className="gs-table__divider gs-table__divider--editable"
								>
									<Button
										className="gs-table__insert-row"
										icon="plus"
										label={ __(
											'Insert row above',
											'gamestuff-blocks'
										) }
										size="small"
										onClick={ () => addDataRow( rowIndex ) }
									/>
									<RichText
										tagName="span"
										className="gs-table__divider-label"
										value={ row.title }
										onChange={ ( value ) =>
											updateGroupTitle( row.id, value )
										}
										placeholder={ __(
											'Group title',
											'gamestuff-blocks'
										) }
									/>
									<DropdownMenu
										icon="ellipsis"
										label={ __(
											'Divider options',
											'gamestuff-blocks'
										) }
										className="gs-table__row-menu"
										controls={ [
											{
												title: row.defaultCollapsed
													? __(
															'Expanded on mobile by default',
															'gamestuff-blocks'
													  )
													: __(
															'Collapsed on mobile by default',
															'gamestuff-blocks'
													  ),
												onClick: () =>
													toggleDefaultCollapsed( row.id ),
											},
											{
												title: __(
													'Remove',
													'gamestuff-blocks'
												),
												onClick: () => removeRow( row.id ),
											},
										] }
									/>
								</div>
							);
						}

						return (
							<div
								key={ row.id }
								className="gs-table__row gs-table__row--editable"
							>
								<Button
									className="gs-table__insert-row"
									icon="plus"
									label={ __(
										'Insert row above',
										'gamestuff-blocks'
									) }
									size="small"
									onClick={ () => addDataRow( rowIndex ) }
								/>
								<DropdownMenu
									icon="ellipsis"
									label={ __( 'Row options', 'gamestuff-blocks' ) }
									className="gs-table__row-menu"
									controls={ [
										{
											title: __(
												'Remove row',
												'gamestuff-blocks'
											),
											onClick: () => removeRow( row.id ),
										},
									] }
								/>
								{ columns.map( ( column ) => {
									const cell = row.cells?.[ column.id ] || emptyCell();

									return (
										<div
											key={ column.id }
											className="gs-table__cell gs-table__cell--editable"
										>
											{ cellModeMenu( row, column, cell ) }

											{ cell.mode === 'text' && (
												<RichText
													tagName="span"
													value={ cell.content }
													onChange={ ( value ) =>
														updateCell( row.id, column.id, {
															content: value,
														} )
													}
													onPaste={ ( event ) =>
														handlePaste(
															event,
															row.id,
															column.id
														)
													}
													allowedFormats={ [
														'core/bold',
														'core/italic',
														'core/link',
													] }
													placeholder={ __(
														'Text…',
														'gamestuff-blocks'
													) }
												/>
											) }

											{ cell.mode === 'image' && (
												<MediaUploadCheck>
													<MediaUpload
														onSelect={ ( media ) =>
															updateCell(
																row.id,
																column.id,
																{
																	imageId: media.id,
																	imageUrl: media.url,
																	imageAlt:
																		media.alt || '',
																}
															)
														}
														allowedTypes={ [ 'image' ] }
														value={ cell.imageId }
														render={ ( { open } ) =>
															cell.imageUrl ? (
																<img
																	src={ cell.imageUrl }
																	alt={ cell.imageAlt }
																	className="gs-table__cell-image-preview"
																	onClick={ open }
																/>
															) : (
																<Button
																	variant="secondary"
																	size="small"
																	onClick={ open }
																>
																	{ __(
																		'Choose image',
																		'gamestuff-blocks'
																	) }
																</Button>
															)
														}
													/>
												</MediaUploadCheck>
											) }

											{ cell.mode === 'richCell' && (
												<span className="gs-table__cell-placeholder">
													{ __(
														'Rich content — edit below ↓',
														'gamestuff-blocks'
													) }
												</span>
											) }
										</div>
									);
								} ) }
							</div>
						);
					} ) }
				</div>

				{ innerBlocks.length > 0 && (
					<div className="gs-table__rich-cells">
						<p className="gs-table__rich-cells-label">
							{ __( 'Rich cell contents', 'gamestuff-blocks' ) }
						</p>
						<InnerBlocks
							allowedBlocks={ [ 'gamestuff/table-cell' ] }
							templateLock={ false }
						/>
					</div>
				) }
			</div>
		</>
	);
}
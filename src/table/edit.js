import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	TextareaControl,
	Button,
} from '@wordpress/components';
import TableToolbar from './table-toolbar';

const PRESET_OPTIONS = [
	{ label: __( 'Standard', 'gamestuff-blocks' ), value: 'standard' },
	{ label: __( 'Compact', 'gamestuff-blocks' ), value: 'compact' },
	{ label: __( 'Comparison', 'gamestuff-blocks' ), value: 'comparison' },
	{ label: __( 'Schedule', 'gamestuff-blocks' ), value: 'schedule' },
	{ label: __( 'Database', 'gamestuff-blocks' ), value: 'database' },
];

const DEFAULT_IMAGE_WIDTH = 48;

function generateColumnKey() {
	return 'col_' + Math.random().toString( 36 ).slice( 2, 8 );
}

function buildEmptyRow( columns ) {
	const row = { isDivider: false };
	columns.forEach( ( col ) => {
		row[ col.key ] = '';
	} );
	return row;
}

export default function Edit( { attributes, setAttributes } ) {
	const { preset, columns, rows, enableSort, enableFilter } = attributes;

	// { rowIndex, colIndex } of the last-focused cell — decides which
	// action in TableToolbar is enabled. rowIndex -1 means the header
	// row (column label) is focused.
	const [ focusedCell, setFocusedCell ] = useState( { rowIndex: null, colIndex: null } );

	const [ pendingColumnCount, setPendingColumnCount ] = useState( '3' );
	const [ pendingRowCount, setPendingRowCount ] = useState( '3' );

	const blockProps = useBlockProps( {
		className: 'gs-table-editor',
	} );

	function resetFocus() {
		setFocusedCell( { rowIndex: null, colIndex: null } );
	}

	function createTable() {
		const columnCount = Math.max( 1, parseInt( pendingColumnCount, 10 ) || 1 );
		const rowCount = Math.max( 1, parseInt( pendingRowCount, 10 ) || 1 );

		const newColumns = [];
		for ( let i = 0; i < columnCount; i++ ) {
			newColumns.push( { key: generateColumnKey(), label: '', type: 'text' } );
		}

		const newRows = [];
		for ( let i = 0; i < rowCount; i++ ) {
			newRows.push( buildEmptyRow( newColumns ) );
		}

		setAttributes( { columns: newColumns, rows: newRows } );
	}

	function updateColumnLabel( colIndex, label ) {
		const newColumns = columns.map( ( col, i ) => ( i === colIndex ? { ...col, label } : col ) );
		setAttributes( { columns: newColumns } );
	}

	function setColumnType( type ) {
		const colIndex = focusedCell.colIndex;

		if ( null === colIndex ) {
			return;
		}

		const changes = { type };

		if ( 'image' === type && ! columns[ colIndex ]?.imageWidth ) {
			changes.imageWidth = DEFAULT_IMAGE_WIDTH;
		}

		const newColumns = columns.map( ( col, i ) => ( i === colIndex ? { ...col, ...changes } : col ) );
		setAttributes( { columns: newColumns } );
	}

	function setColumnImageWidth( colIndex, width ) {
		const newColumns = columns.map( ( col, i ) => ( i === colIndex ? { ...col, imageWidth: width } : col ) );
		setAttributes( { columns: newColumns } );
	}

	function insertColumn( atIndex ) {
		const newColumn = { key: generateColumnKey(), label: '', type: 'text' };
		const newColumns = [ ...columns ];
		newColumns.splice( atIndex, 0, newColumn );

		const newRows = rows.map( ( row ) => ( { ...row, [ newColumn.key ]: '' } ) );

		setAttributes( { columns: newColumns, rows: newRows } );
		resetFocus();
	}

	function deleteColumn() {
		const colIndex = focusedCell.colIndex;

		if ( null === colIndex ) {
			return;
		}

		const key = columns[ colIndex ].key;
		const newColumns = columns.filter( ( _col, i ) => i !== colIndex );
		const newRows = rows.map( ( row ) => {
			const updated = { ...row };
			delete updated[ key ];
			return updated;
		} );

		setAttributes( { columns: newColumns, rows: newRows } );
		resetFocus();
	}

	function insertRow( atIndex ) {
		const newRows = [ ...rows ];
		newRows.splice( atIndex, 0, buildEmptyRow( columns ) );
		setAttributes( { rows: newRows } );
		resetFocus();
	}

	function deleteRow() {
		const rowIndex = focusedCell.rowIndex;

		if ( null === rowIndex || -1 === rowIndex ) {
			return;
		}

		setAttributes( { rows: rows.filter( ( _row, i ) => i !== rowIndex ) } );
		resetFocus();
	}

	function toggleDivider() {
		const rowIndex = focusedCell.rowIndex;

		if ( null === rowIndex || -1 === rowIndex ) {
			return;
		}

		const newRows = rows.map( ( row, i ) => ( i === rowIndex ? { ...row, isDivider: ! row.isDivider } : row ) );
		setAttributes( { rows: newRows } );
	}

	function updateRow( rowIndex, changes ) {
		const newRows = rows.map( ( row, i ) => ( i === rowIndex ? { ...row, ...changes } : row ) );
		setAttributes( { rows: newRows } );
	}

	function updateCell( rowIndex, key, value ) {
		updateRow( rowIndex, { [ key ]: value } );
	}

	function updateCellImage( rowIndex, key, media ) {
		updateCell( rowIndex, key, media ? { id: media.id, url: media.url, alt: media.alt || '' } : null );
	}

	const focusedColumn = null !== focusedCell.colIndex ? columns[ focusedCell.colIndex ] : null;

	return (
		<>
			{ columns.length > 0 && (
				<TableToolbar
					focusedCell={ focusedCell }
					rows={ rows }
					onInsertRowBefore={ () => insertRow( focusedCell.rowIndex ) }
					onInsertRowAfter={ () => insertRow( focusedCell.rowIndex + 1 ) }
					onDeleteRow={ deleteRow }
					onToggleDivider={ toggleDivider }
					onInsertColumnBefore={ () => insertColumn( focusedCell.colIndex ) }
					onInsertColumnAfter={ () => insertColumn( focusedCell.colIndex + 1 ) }
					onDeleteColumn={ deleteColumn }
					onSetColumnType={ setColumnType }
				/>
			) }

			<InspectorControls>
				<PanelBody title={ __( 'Table Settings', 'gamestuff-blocks' ) }>
					<SelectControl
						label={ __( 'Preset', 'gamestuff-blocks' ) }
						value={ preset }
						options={ PRESET_OPTIONS }
						onChange={ ( value ) => setAttributes( { preset: value } ) }
					/>
					<ToggleControl
						label={ __( 'Sortable', 'gamestuff-blocks' ) }
						checked={ enableSort }
						onChange={ ( value ) => setAttributes( { enableSort: value } ) }
					/>
					<ToggleControl
						label={ __( 'Searchable', 'gamestuff-blocks' ) }
						checked={ enableFilter }
						onChange={ ( value ) => setAttributes( { enableFilter: value } ) }
					/>

					{ focusedColumn && 'image' === focusedColumn.type && (
						<TextControl
							label={ __( 'Image width — focused column (px)', 'gamestuff-blocks' ) }
							help={ __( 'The focused column is whichever cell you last clicked.', 'gamestuff-blocks' ) }
							type="number"
							value={ focusedColumn.imageWidth ?? DEFAULT_IMAGE_WIDTH }
							onChange={ ( value ) =>
								setColumnImageWidth( focusedCell.colIndex, parseInt( value, 10 ) || DEFAULT_IMAGE_WIDTH )
							}
						/>
					) }
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ 0 === columns.length ? (
					<div className="gs-table-editor__empty">
						<p>{ __( 'Create a new table.', 'gamestuff-blocks' ) }</p>
						<div className="gs-table-editor__empty-fields">
							<TextControl
								label={ __( 'Number of columns', 'gamestuff-blocks' ) }
								type="number"
								min="1"
								value={ pendingColumnCount }
								onChange={ setPendingColumnCount }
							/>
							<TextControl
								label={ __( 'Number of rows', 'gamestuff-blocks' ) }
								type="number"
								min="1"
								value={ pendingRowCount }
								onChange={ setPendingRowCount }
							/>
						</div>
						<Button variant="primary" onClick={ createTable }>
							{ __( 'Create Table', 'gamestuff-blocks' ) }
						</Button>
					</div>
				) : (
					<table className="gs-table-editor__grid">
						<thead>
							<tr>
								{ columns.map( ( col, colIndex ) => (
									<th key={ col.key }>
										<TextControl
											label={ __( 'Column label', 'gamestuff-blocks' ) }
											hideLabelFromVision
											placeholder={ __( 'Column label', 'gamestuff-blocks' ) }
											value={ col.label }
											onChange={ ( value ) => updateColumnLabel( colIndex, value ) }
											onFocus={ () => setFocusedCell( { rowIndex: -1, colIndex } ) }
										/>
									</th>
								) ) }
							</tr>
						</thead>
						<tbody>
							{ rows.map( ( row, rowIndex ) => (
								<tr
									key={ rowIndex }
									className={ row.isDivider ? 'gs-table-editor__row--divider' : undefined }
								>
									{ row.isDivider ? (
										<td colSpan={ columns.length }>
											<TextControl
												label={ __( 'Divider text', 'gamestuff-blocks' ) }
												hideLabelFromVision
												placeholder={ __( 'Divider text…', 'gamestuff-blocks' ) }
												value={ row.dividerLabel ?? '' }
												onChange={ ( value ) => updateRow( rowIndex, { dividerLabel: value } ) }
												onFocus={ () => setFocusedCell( { rowIndex, colIndex: null } ) }
											/>
										</td>
									) : (
										columns.map( ( col, colIndex ) => (
											<td key={ col.key }>
												{ 'image' === col.type && (
													<MediaUploadCheck>
														<MediaUpload
															onSelect={ ( media ) => updateCellImage( rowIndex, col.key, media ) }
															allowedTypes={ [ 'image' ] }
															value={ row[ col.key ]?.id }
															render={ ( { open } ) => (
																<div onFocus={ () => setFocusedCell( { rowIndex, colIndex } ) }>
																	{ row[ col.key ]?.url ? (
																		<div className="gs-table-editor__image-cell">
																			<img
																				src={ row[ col.key ].url }
																				alt=""
																				style={ {
																					width: ( col.imageWidth || DEFAULT_IMAGE_WIDTH ) + 'px',
																				} }
																			/>
																			<Button variant="link" onClick={ open } isSmall>
																				{ __( 'Replace', 'gamestuff-blocks' ) }
																			</Button>
																			<Button
																				variant="link"
																				isDestructive
																				isSmall
																				onClick={ () => updateCellImage( rowIndex, col.key, null ) }
																			>
																				{ __( 'Remove image', 'gamestuff-blocks' ) }
																			</Button>
																		</div>
																	) : (
																		<Button variant="secondary" isSmall onClick={ open }>
																			{ __( 'Choose image', 'gamestuff-blocks' ) }
																		</Button>
																	) }
																</div>
															) }
														/>
													</MediaUploadCheck>
												) }

												{ 'number' === col.type && (
													<TextControl
														label={ __( 'Cell value', 'gamestuff-blocks' ) }
														hideLabelFromVision
														type="number"
														value={ row[ col.key ] ?? '' }
														onChange={ ( value ) => updateCell( rowIndex, col.key, value ) }
														onFocus={ () => setFocusedCell( { rowIndex, colIndex } ) }
													/>
												) }

												{ 'text' === col.type && (
													<TextareaControl
														label={ __( 'Cell value', 'gamestuff-blocks' ) }
														hideLabelFromVision
														value={ row[ col.key ] ?? '' }
														onChange={ ( value ) => updateCell( rowIndex, col.key, value ) }
														onFocus={ () => setFocusedCell( { rowIndex, colIndex } ) }
														rows={ 2 }
													/>
												) }
											</td>
										) )
									) }
								</tr>
							) ) }
						</tbody>
					</table>
				) }
			</div>
		</>
	);
}
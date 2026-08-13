import { __ } from '@wordpress/i18n';
import { BlockControls } from '@wordpress/block-editor';
import {
	ToolbarGroup,
	DropdownMenu,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';

const COLUMN_TYPE_LABELS = {
	text: __( 'Text', 'gamestuff-blocks' ),
	number: __( 'Number', 'gamestuff-blocks' ),
	image: __( 'Image', 'gamestuff-blocks' ),
};

export default function TableToolbar( {
	focusedCell,
	rows,
	onInsertRowBefore,
	onInsertRowAfter,
	onDeleteRow,
	onToggleDivider,
	onInsertColumnBefore,
	onInsertColumnAfter,
	onDeleteColumn,
	onSetColumnType,
} ) {
	const hasFocusedRow =
		null !== focusedCell.rowIndex && -1 !== focusedCell.rowIndex;
	const hasFocusedColumn = null !== focusedCell.colIndex;
	const focusedRowIsDivider =
		hasFocusedRow && !! rows[ focusedCell.rowIndex ]?.isDivider;

	return (
		<BlockControls>
			<ToolbarGroup>
				<DropdownMenu
					text={ __( 'Row', 'gamestuff-blocks' ) }
					label={ __( 'Row actions', 'gamestuff-blocks' ) }
				>
					{ ( { onClose } ) => (
						<>
							<MenuGroup>
								<MenuItem
									disabled={ ! hasFocusedRow }
									onClick={ () => {
										onInsertRowBefore();
										onClose();
									} }
								>
									{ __(
										'Insert row before',
										'gamestuff-blocks'
									) }
								</MenuItem>
								<MenuItem
									disabled={ ! hasFocusedRow }
									onClick={ () => {
										onInsertRowAfter();
										onClose();
									} }
								>
									{ __(
										'Insert row after',
										'gamestuff-blocks'
									) }
								</MenuItem>
								<MenuItem
									disabled={ ! hasFocusedRow }
									isDestructive
									onClick={ () => {
										onDeleteRow();
										onClose();
									} }
								>
									{ __(
										'Delete this row',
										'gamestuff-blocks'
									) }
								</MenuItem>
							</MenuGroup>
							<MenuGroup
								label={ __( 'Divider', 'gamestuff-blocks' ) }
							>
								<MenuItem
									disabled={ ! hasFocusedRow }
									onClick={ () => {
										onToggleDivider();
										onClose();
									} }
								>
									{ focusedRowIsDivider
										? __(
												'Unset as divider',
												'gamestuff-blocks'
										  )
										: __(
												'Make this row a divider',
												'gamestuff-blocks'
										  ) }
								</MenuItem>
							</MenuGroup>
						</>
					) }
				</DropdownMenu>

				<DropdownMenu
					text={ __( 'Column', 'gamestuff-blocks' ) }
					label={ __( 'Column actions', 'gamestuff-blocks' ) }
				>
					{ ( { onClose } ) => (
						<>
							<MenuGroup>
								<MenuItem
									disabled={ ! hasFocusedColumn }
									onClick={ () => {
										onInsertColumnBefore();
										onClose();
									} }
								>
									{ __(
										'Insert column before',
										'gamestuff-blocks'
									) }
								</MenuItem>
								<MenuItem
									disabled={ ! hasFocusedColumn }
									onClick={ () => {
										onInsertColumnAfter();
										onClose();
									} }
								>
									{ __(
										'Insert column after',
										'gamestuff-blocks'
									) }
								</MenuItem>
								<MenuItem
									disabled={ ! hasFocusedColumn }
									isDestructive
									onClick={ () => {
										onDeleteColumn();
										onClose();
									} }
								>
									{ __(
										'Delete this column',
										'gamestuff-blocks'
									) }
								</MenuItem>
							</MenuGroup>
							<MenuGroup
								label={ __(
									'Change column type',
									'gamestuff-blocks'
								) }
							>
								{ Object.keys( COLUMN_TYPE_LABELS ).map(
									( type ) => (
										<MenuItem
											key={ type }
											disabled={ ! hasFocusedColumn }
											onClick={ () => {
												onSetColumnType( type );
												onClose();
											} }
										>
											{ COLUMN_TYPE_LABELS[ type ] }
										</MenuItem>
									)
								) }
							</MenuGroup>
						</>
					) }
				</DropdownMenu>
			</ToolbarGroup>
		</BlockControls>
	);
}

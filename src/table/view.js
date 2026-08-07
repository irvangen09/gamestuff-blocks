// Progressive enhancement — the saved markup is a plain, readable
// CSS Grid (works with zero JS). This builds a second, mobile-only
// structure (grouped, expandable rows) from the same source data by
// reading it back out of the DOM via data-* attributes, then clones
// each cell's live content into it. Which structure is visible is
// decided entirely by CSS media query — this script never toggles
// visibility itself, so there's no resize listener to keep in sync.
document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( '.gs-table' ).forEach( initTable );
} );

function initTable( tableEl ) {
	const grid = tableEl.querySelector( ':scope > .gs-table__grid' );
	if ( ! grid ) {
		return;
	}

	const columns = readColumns( grid );
	if ( columns.length === 0 ) {
		return;
	}

	const identityColumn = columns[ 0 ];
	const primaryColumn = columns.find(
		( c ) => c.isPrimary && c.id !== identityColumn.id
	);

	const cellsByRow = groupCellsByRow( grid );

	const rowEls = Array.from( grid.children ).filter( ( el ) =>
		el.matches( '.gs-table__divider, .gs-table__row:not(.gs-table__row--header)' )
	);

	const mobileWrap = document.createElement( 'div' );
	mobileWrap.className = 'gs-table__mobile';

	let currentGroupRows = null;

	rowEls.forEach( ( rowEl ) => {
		if ( rowEl.classList.contains( 'gs-table__divider' ) ) {
			currentGroupRows = buildGroup( rowEl, mobileWrap );
			return;
		}

		const rowId = rowEl.dataset.rowId;
		const cells = ( cellsByRow[ rowId ] || [] ).sort(
			( a, b ) => Number( a.dataset.columnIndex ) - Number( b.dataset.columnIndex )
		);

		const rowMobileEl = buildRow( cells, identityColumn, primaryColumn, columns );
		( currentGroupRows || mobileWrap ).appendChild( rowMobileEl );
	} );

	tableEl.appendChild( mobileWrap );
}

function readColumns( grid ) {
	return Array.from(
		grid.querySelectorAll( ':scope > .gs-table__row--header > [role="columnheader"]' )
	)
		.map( ( headerCell ) => ( {
			id: headerCell.dataset.columnId,
			index: Number( headerCell.dataset.columnIndex ),
			label: headerCell.textContent.trim(),
			isPrimary: headerCell.dataset.mobilePrimary === 'true',
		} ) )
		.sort( ( a, b ) => a.index - b.index );
}

// Cells belonging to a row aren't always its DOM children — richCell
// cells are rendered as siblings of the row wrapper (see save.js) —
// so cells are matched to a row via the closest ancestor (or itself)
// carrying data-row-id, not via direct DOM nesting.
function groupCellsByRow( grid ) {
	const cellEls = Array.from( grid.querySelectorAll( '[data-column-id]' ) ).filter(
		( el ) => ! el.classList.contains( 'gs-table__col-header' )
	);

	const cellsByRow = {};
	cellEls.forEach( ( cellEl ) => {
		const rowHost = cellEl.closest( '[data-row-id]' );
		if ( ! rowHost ) {
			return;
		}
		const rowId = rowHost.dataset.rowId;
		( cellsByRow[ rowId ] ||= [] ).push( cellEl );
	} );

	return cellsByRow;
}

function buildGroup( dividerEl, mobileWrap ) {
	const titleCell = dividerEl.querySelector( ':scope > .gs-table__divider-cell' );
	const title = titleCell ? titleCell.textContent.trim() : '';
	const defaultCollapsed = dividerEl.dataset.defaultCollapsed === 'true';

	const groupEl = document.createElement( 'div' );
	groupEl.className = 'gs-table__group';

	const toggle = document.createElement( 'button' );
	toggle.type = 'button';
	toggle.className = 'gs-table__group-toggle';
	toggle.setAttribute( 'aria-expanded', defaultCollapsed ? 'false' : 'true' );

	const titleSpan = document.createElement( 'span' );
	titleSpan.textContent = title;

	const chevron = document.createElement( 'span' );
	chevron.className = 'gs-table__chevron';
	chevron.setAttribute( 'aria-hidden', 'true' );

	toggle.append( titleSpan, chevron );

	const rowsWrap = document.createElement( 'div' );
	rowsWrap.className = 'gs-table__group-rows';
	rowsWrap.hidden = defaultCollapsed;

	toggle.addEventListener( 'click', () => {
		const isHidden = rowsWrap.hidden;
		rowsWrap.hidden = ! isHidden;
		toggle.setAttribute( 'aria-expanded', isHidden ? 'true' : 'false' );
	} );

	groupEl.append( toggle, rowsWrap );
	mobileWrap.appendChild( groupEl );

	return rowsWrap;
}

function buildRow( cells, identityColumn, primaryColumn, columns ) {
	const identityCell = cells.find( ( c ) => c.dataset.columnId === identityColumn.id );
	const primaryCell = primaryColumn
		? cells.find( ( c ) => c.dataset.columnId === primaryColumn.id )
		: null;
	const detailCells = cells.filter(
		( c ) =>
			c.dataset.columnId !== identityColumn.id &&
			( ! primaryColumn || c.dataset.columnId !== primaryColumn.id )
	);

	const toggle = document.createElement( 'button' );
	toggle.type = 'button';
	toggle.className = 'gs-table__row-toggle';
	toggle.setAttribute( 'aria-expanded', 'false' );

	const identitySpan = document.createElement( 'span' );
	identitySpan.className = 'gs-table__row-identity';
	if ( identityCell ) {
		identitySpan.appendChild( cloneCellContent( identityCell ) );
	}

	const primarySpan = document.createElement( 'span' );
	primarySpan.className = 'gs-table__row-primary';
	if ( primaryCell ) {
		primarySpan.appendChild( cloneCellContent( primaryCell ) );
	}

	toggle.append( identitySpan, primarySpan );

	const detailWrap = document.createElement( 'div' );
	detailWrap.className = 'gs-table__row-detail';
	detailWrap.hidden = true;

	detailCells.forEach( ( cellEl ) => {
		const columnMeta = columns.find( ( c ) => c.id === cellEl.dataset.columnId );

		const line = document.createElement( 'div' );
		line.className = 'gs-table__row-detail-line';

		const label = document.createElement( 'span' );
		label.className = 'gs-table__row-detail-label';
		label.textContent = columnMeta ? columnMeta.label : '';

		const value = document.createElement( 'span' );
		value.className = 'gs-table__row-detail-value';
		value.appendChild( cloneCellContent( cellEl ) );

		line.append( label, value );
		detailWrap.appendChild( line );
	} );

	toggle.addEventListener( 'click', () => {
		const isHidden = detailWrap.hidden;
		detailWrap.hidden = ! isHidden;
		toggle.setAttribute( 'aria-expanded', isHidden ? 'true' : 'false' );
	} );

	const rowWrap = document.createElement( 'div' );
	rowWrap.className = 'gs-table__mobile-row';
	rowWrap.append( toggle, detailWrap );

	return rowWrap;
}

function cloneCellContent( cellEl ) {
	const frag = document.createDocumentFragment();
	Array.from( cellEl.childNodes ).forEach( ( node ) => {
		frag.appendChild( node.cloneNode( true ) );
	} );
	return frag;
}
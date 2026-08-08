// Sort and search for Table on the frontend. Without this file the
// table still renders fully and stays readable — just without these
// interactions. Only Style 3's mobile layout needs JS (it swaps to a
// different structure entirely); every other preset's mobile layout
// is pure CSS. This file only ever runs on the frontend (viewScript).
( function () {
	function getCellText( row, key ) {
		var cell = row.querySelector( '[data-key="' + key + '"]' );
		return cell ? cell.textContent.trim() : '';
	}

	function isDividerRow( row ) {
		return row.classList.contains( 'gs-table__row--divider' );
	}

	// Splits tbody rows into groups at each Divider boundary, so sort
	// stays scoped within a group instead of scrambling the sections
	// a Divider was meant to keep apart.
	function groupRowsByDivider( rows ) {
		var groups = [];
		var currentGroup = [];

		rows.forEach( function ( row ) {
			if ( isDividerRow( row ) ) {
				groups.push( { divider: null, rows: currentGroup } );
				groups.push( { divider: row, rows: [] } );
				currentGroup = [];
			} else {
				currentGroup.push( row );
			}
		} );

		groups.push( { divider: null, rows: currentGroup } );

		return groups;
	}

	function compareRows( a, b, key, type, direction ) {
		var aText = getCellText( a, key );
		var bText = getCellText( b, key );
		var result;

		if ( 'number' === type ) {
			result = parseFloat( aText || '0' ) - parseFloat( bText || '0' );
		} else {
			result = aText.localeCompare( bText, undefined, { numeric: true, sensitivity: 'base' } );
		}

		return 'desc' === direction ? -result : result;
	}

	function sortRows( tableEl, key, type, direction ) {
		var tbody = tableEl.querySelector( 'tbody' );
		var allRows = Array.prototype.slice.call( tbody.querySelectorAll( 'tr' ) );
		var groups = groupRowsByDivider( allRows );

		groups.forEach( function ( group ) {
			group.rows.sort( function ( a, b ) {
				return compareRows( a, b, key, type, direction );
			} );
		} );

		// Dividers never move — each group's rows are re-appended in
		// their new order, followed by the divider that closes it.
		groups.forEach( function ( group ) {
			group.rows.forEach( function ( row ) {
				tbody.appendChild( row );
			} );

			if ( group.divider ) {
				tbody.appendChild( group.divider );
			}
		} );
	}

	function initSort( tableEl ) {
		var headers = Array.prototype.slice.call( tableEl.querySelectorAll( 'thead th' ) );

		headers.forEach( function ( th ) {
			var direction = null;

			th.classList.add( 'gs-table__sortable' );
			th.setAttribute( 'role', 'button' );
			th.setAttribute( 'tabindex', '0' );

			function activateSort() {
				headers.forEach( function ( other ) {
					if ( other !== th ) {
						other.removeAttribute( 'data-sort-direction' );
					}
				} );

				direction = 'asc' === direction ? 'desc' : 'asc';
				th.setAttribute( 'data-sort-direction', direction );

				sortRows( tableEl, th.getAttribute( 'data-key' ), th.getAttribute( 'data-type' ), direction );
			}

			th.addEventListener( 'click', activateSort );

			th.addEventListener( 'keydown', function ( event ) {
				if ( 'Enter' === event.key || ' ' === event.key ) {
					event.preventDefault();
					activateSort();
				}
			} );
		} );
	}

	function rowMatchesQuery( row, query ) {
		var text = row.textContent.toLowerCase();
		return '' === query || -1 !== text.indexOf( query );
	}

	function applyFilter( tableEl, query ) {
		var tbody = tableEl.querySelector( 'tbody' );
		var allRows = Array.prototype.slice.call( tbody.querySelectorAll( 'tr' ) );
		var groups = groupRowsByDivider( allRows );

		groups.forEach( function ( group ) {
			var groupHasMatch = false;

			group.rows.forEach( function ( row ) {
				var matches = rowMatchesQuery( row, query );
				row.toggleAttribute( 'hidden', ! matches );

				if ( matches ) {
					groupHasMatch = true;
				}
			} );

			if ( group.divider ) {
				// Hide an empty section heading rather than leaving a
				// Divider with nothing matching underneath it.
				group.divider.toggleAttribute( 'hidden', '' !== query && ! groupHasMatch );
			}
		} );
	}

	function initFilter( wrapperEl, tableEl ) {
		var searchWrap = document.createElement( 'div' );
		searchWrap.className = 'gs-table__filter';

		var input = document.createElement( 'input' );
		input.type = 'search';
		input.className = 'gs-table__filter-input';
		input.setAttribute( 'placeholder', 'Search this table…' );
		input.setAttribute( 'aria-label', 'Search within this table' );

		searchWrap.appendChild( input );
		wrapperEl.insertBefore( searchWrap, tableEl );

		input.addEventListener( 'input', function () {
			applyFilter( tableEl, input.value.trim().toLowerCase() );
		} );
	}

	// Card layout (Style 2) has no clickable header, so only search
	// applies here — sort is skipped entirely for this preset.
	function applyCardFilter( cardsEl, query ) {
		var items = Array.prototype.slice.call( cardsEl.children );
		var currentDivider = null;
		var groupHasMatch = false;

		function closeGroup() {
			if ( currentDivider ) {
				currentDivider.toggleAttribute( 'hidden', '' !== query && ! groupHasMatch );
			}
		}

		items.forEach( function ( item ) {
			if ( item.classList.contains( 'gs-table__cards-divider' ) ) {
				closeGroup();
				currentDivider = item;
				groupHasMatch = false;
				return;
			}

			var matches = rowMatchesQuery( item, query );
			item.toggleAttribute( 'hidden', ! matches );

			if ( matches ) {
				groupHasMatch = true;
			}
		} );

		closeGroup();
	}

	function initCardFilter( wrapperEl, cardsEl ) {
		var searchWrap = document.createElement( 'div' );
		searchWrap.className = 'gs-table__filter';

		var input = document.createElement( 'input' );
		input.type = 'search';
		input.className = 'gs-table__filter-input';
		input.setAttribute( 'placeholder', 'Search this table…' );
		input.setAttribute( 'aria-label', 'Search within this table' );

		searchWrap.appendChild( input );
		wrapperEl.insertBefore( searchWrap, cardsEl );

		input.addEventListener( 'input', function () {
			applyCardFilter( cardsEl, input.value.trim().toLowerCase() );
		} );
	}

	// Style 3's mobile view: built once from the table's own data-*
	// attributes and appended alongside it — style.scss hides the
	// <table> and shows this instead under the mobile breakpoint.
	// Column role is positional: column 1 = identity, column 2 =
	// secondary (both always visible), column 3+ = detail on tap.
	function buildMobileExpand( wrapperEl, tableEl ) {
		var headerCells = Array.prototype.slice.call( tableEl.querySelectorAll( 'thead th' ) );
		var columns = headerCells.map( function ( th ) {
			return { key: th.getAttribute( 'data-key' ), label: th.textContent.trim() };
		} );

		if ( 0 === columns.length ) {
			return;
		}

		var identityKey = columns[ 0 ].key;
		var primaryKey = columns.length > 1 ? columns[ 1 ].key : null;
		var detailColumns = columns.slice( primaryKey ? 2 : 1 );

		var expandEl = document.createElement( 'div' );
		expandEl.className = 'gs-table__expand';

		var rows = Array.prototype.slice.call( tableEl.querySelectorAll( 'tbody tr' ) );
		var currentGroupWrap = null;

		rows.forEach( function ( row ) {
			if ( isDividerRow( row ) ) {
				var dividerCell = row.querySelector( '.gs-table__divider-cell' );
				var title = dividerCell ? dividerCell.textContent.trim() : '';

				var groupToggle = document.createElement( 'button' );
				groupToggle.type = 'button';
				groupToggle.className = 'gs-table__expand-group-toggle';
				groupToggle.setAttribute( 'aria-expanded', 'true' );

				var titleSpan = document.createElement( 'span' );
				titleSpan.textContent = title;

				var groupChevron = document.createElement( 'span' );
				groupChevron.className = 'gs-table__expand-chevron';
				groupChevron.setAttribute( 'aria-hidden', 'true' );

				groupToggle.append( titleSpan, groupChevron );

				var groupRows = document.createElement( 'div' );
				groupRows.className = 'gs-table__expand-group-rows';

				groupToggle.addEventListener( 'click', function () {
					var isHidden = groupRows.hidden;
					groupRows.hidden = ! isHidden;
					groupToggle.setAttribute( 'aria-expanded', isHidden ? 'true' : 'false' );
				} );

				expandEl.append( groupToggle, groupRows );
				currentGroupWrap = groupRows;
				return;
			}

			var rowWrap = document.createElement( 'div' );
			rowWrap.className = 'gs-table__expand-row';

			var rowToggle = document.createElement( 'button' );
			rowToggle.type = 'button';
			rowToggle.className = 'gs-table__expand-toggle';
			rowToggle.setAttribute( 'aria-expanded', 'false' );

			var identitySpan = document.createElement( 'span' );
			identitySpan.className = 'gs-table__expand-identity';
			identitySpan.textContent = getCellText( row, identityKey );

			var primarySpan = document.createElement( 'span' );
			primarySpan.className = 'gs-table__expand-primary';
			primarySpan.textContent = primaryKey ? getCellText( row, primaryKey ) : '';

			rowToggle.append( identitySpan, primarySpan );

			var detailWrap = document.createElement( 'div' );
			detailWrap.className = 'gs-table__expand-detail';
			detailWrap.hidden = true;

			detailColumns.forEach( function ( col ) {
				var line = document.createElement( 'div' );
				line.className = 'gs-table__expand-detail-line';

				var strong = document.createElement( 'strong' );
				strong.textContent = col.label + ':';

				line.appendChild( strong );
				line.appendChild( document.createTextNode( ' ' + getCellText( row, col.key ) ) );

				detailWrap.appendChild( line );
			} );

			rowToggle.addEventListener( 'click', function () {
				var isHidden = detailWrap.hidden;
				detailWrap.hidden = ! isHidden;
				rowToggle.setAttribute( 'aria-expanded', isHidden ? 'true' : 'false' );
			} );

			rowWrap.append( rowToggle, detailWrap );

			( currentGroupWrap || expandEl ).appendChild( rowWrap );
		} );

		wrapperEl.appendChild( expandEl );
	}

	document.querySelectorAll( '.gs-table' ).forEach( function ( wrapperEl ) {
		var tableEl = wrapperEl.querySelector( '.gs-table__table' );

		if ( tableEl ) {
			if ( 'true' === wrapperEl.getAttribute( 'data-sort' ) ) {
				initSort( tableEl );
			}

			if ( 'true' === wrapperEl.getAttribute( 'data-filter' ) ) {
				initFilter( wrapperEl, tableEl );
			}

			if ( 'style-3' === wrapperEl.getAttribute( 'data-preset' ) ) {
				buildMobileExpand( wrapperEl, tableEl );
			}

			return;
		}

		var cardsEl = wrapperEl.querySelector( '.gs-table__cards' );

		if ( cardsEl && 'true' === wrapperEl.getAttribute( 'data-filter' ) ) {
			initCardFilter( wrapperEl, cardsEl );
		}
	} );
} )();
// Sort and search for Table on the frontend. Without this file the
// table still renders fully and stays readable — just without these
// two interactions. Mobile layout itself needs no JS at all (see
// style.scss); this file only ever runs on the frontend (viewScript).
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

	document.querySelectorAll( '.gs-table' ).forEach( function ( wrapperEl ) {
		var tableEl = wrapperEl.querySelector( '.gs-table__table' );

		if ( ! tableEl ) {
			return;
		}

		if ( 'true' === wrapperEl.getAttribute( 'data-sort' ) ) {
			initSort( tableEl );
		}

		if ( 'true' === wrapperEl.getAttribute( 'data-filter' ) ) {
			initFilter( wrapperEl, tableEl );
		}
	} );
} )();
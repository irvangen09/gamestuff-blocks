// Sort and search for Table on the frontend — without this file the
// table still renders fully and stays readable, just without these
// interactions.
( function () {
	function getCellText( row, key ) {
		const cell = row.querySelector( '[data-key="' + key + '"]' );
		return cell ? cell.textContent.trim() : '';
	}

	function isDividerRow( row ) {
		return row.classList.contains( 'gs-table__row--divider' );
	}

	// Splits tbody rows into groups at each Divider boundary, so sort
	// stays scoped within a group instead of scrambling the sections
	// a Divider was meant to keep apart.
	function groupRowsByDivider( rows ) {
		const groups = [];
		let currentGroup = [];

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
		const aText = getCellText( a, key );
		const bText = getCellText( b, key );
		let result;

		if ( 'number' === type ) {
			result = parseFloat( aText || '0' ) - parseFloat( bText || '0' );
		} else {
			result = aText.localeCompare( bText, undefined, {
				numeric: true,
				sensitivity: 'base',
			} );
		}

		return 'desc' === direction ? -result : result;
	}

	function sortRows( tableEl, key, type, direction ) {
		const tbody = tableEl.querySelector( 'tbody' );
		const allRows = Array.prototype.slice.call(
			tbody.querySelectorAll( 'tr' )
		);
		const groups = groupRowsByDivider( allRows );

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
		const headers = Array.prototype.slice.call(
			tableEl.querySelectorAll( 'thead th' )
		);

		headers.forEach( function ( th ) {
			let direction = null;

			th.classList.add( 'gs-table__sortable' );
			th.setAttribute( 'role', 'button' );
			th.setAttribute( 'tabindex', '0' );
			th.setAttribute( 'aria-sort', 'none' );

			function activateSort() {
				headers.forEach( function ( other ) {
					if ( other !== th ) {
						other.removeAttribute( 'data-sort-direction' );
						other.setAttribute( 'aria-sort', 'none' );
					}
				} );

				direction = 'asc' === direction ? 'desc' : 'asc';
				th.setAttribute( 'data-sort-direction', direction );
				th.setAttribute(
					'aria-sort',
					'asc' === direction ? 'ascending' : 'descending'
				);

				sortRows(
					tableEl,
					th.getAttribute( 'data-key' ),
					th.getAttribute( 'data-type' ),
					direction
				);
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
		const text = row.textContent.toLowerCase();
		return '' === query || -1 !== text.indexOf( query );
	}

	function applyFilter( tableEl, query ) {
		const tbody = tableEl.querySelector( 'tbody' );
		const allRows = Array.prototype.slice.call(
			tbody.querySelectorAll( 'tr' )
		);
		const groups = groupRowsByDivider( allRows );

		groups.forEach( function ( group ) {
			let groupHasMatch = false;

			group.rows.forEach( function ( row ) {
				const matches = rowMatchesQuery( row, query );
				row.toggleAttribute( 'hidden', ! matches );

				if ( matches ) {
					groupHasMatch = true;
				}
			} );

			if ( group.divider ) {
				// Hide an empty section heading rather than leaving a
				// Divider with nothing matching underneath it.
				group.divider.toggleAttribute(
					'hidden',
					'' !== query && ! groupHasMatch
				);
			}
		} );
	}

	function initFilter( wrapperEl, tableEl ) {
		const searchWrap = document.createElement( 'div' );
		searchWrap.className = 'gs-table__filter';

		const input = document.createElement( 'input' );
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

	// Search-only for Style 2 (no clickable header). cardsEl is a
	// <table> (see save.js); .rows reads all <tr> rows directly.
	function applyCardFilter( cardsEl, query ) {
		const items = Array.prototype.slice.call( cardsEl.rows );
		let currentDivider = null;
		let groupHasMatch = false;

		function closeGroup() {
			if ( currentDivider ) {
				currentDivider.toggleAttribute(
					'hidden',
					'' !== query && ! groupHasMatch
				);
			}
		}

		items.forEach( function ( item ) {
			if ( item.classList.contains( 'gs-table__row--divider' ) ) {
				closeGroup();
				currentDivider = item;
				groupHasMatch = false;
				return;
			}

			const matches = rowMatchesQuery( item, query );
			item.toggleAttribute( 'hidden', ! matches );

			if ( matches ) {
				groupHasMatch = true;
			}
		} );

		closeGroup();
	}

	function initCardFilter( wrapperEl, cardsEl ) {
		const searchWrap = document.createElement( 'div' );
		searchWrap.className = 'gs-table__filter';

		const input = document.createElement( 'input' );
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

	document.querySelectorAll( '.gs-table' ).forEach( function ( wrapperEl ) {
		const tableEl = wrapperEl.querySelector( '.gs-table__table' );

		if ( tableEl ) {
			if ( 'true' === wrapperEl.getAttribute( 'data-sort' ) ) {
				initSort( tableEl );
			}

			if ( 'true' === wrapperEl.getAttribute( 'data-filter' ) ) {
				initFilter( wrapperEl, tableEl );
			}

			return;
		}

		const cardsEl = wrapperEl.querySelector( '.gs-table__cards' );

		if ( cardsEl && 'true' === wrapperEl.getAttribute( 'data-filter' ) ) {
			initCardFilter( wrapperEl, cardsEl );
		}
	} );
} )();
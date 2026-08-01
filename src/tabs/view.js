/**
 * Progressive enhancement for the Tabs block.
 *
 * Saved markup is plain and fully readable without JS: every Tab
 * Item's label sits as a heading-like marker directly above its own
 * content, all shown in sequence. This script turns that into an
 * interactive tab widget with full ARIA (WAI-ARIA Tabs Pattern) —
 * if it fails to load, visitors still get all the content, just
 * without the ability to switch panels.
 *
 * Only loaded on the frontend (viewScript in block.json).
 */
( function () {
	function initTabs( tabsEl, tabsIndex ) {
		var items = Array.prototype.slice.call(
			tabsEl.querySelectorAll( ':scope > .gs-tabs-item' )
		);

		if ( items.length === 0 ) {
			return;
		}

		var isVertical = tabsEl.dataset.style === 'sidebar';
		var nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
		var prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

		var tablist = document.createElement( 'div' );
		tablist.className = 'gs-tabs__nav';
		tablist.setAttribute( 'role', 'tablist' );
		tablist.setAttribute(
			'aria-orientation',
			isVertical ? 'vertical' : 'horizontal'
		);

		// Panels get their own wrapper (unlike Lunar Core's original,
		// which leaves them as loose siblings) so the sidebar variant
		// has a single element to lay out as the second flex column.
		var panelsWrap = document.createElement( 'div' );
		panelsWrap.className = 'gs-tabs__panels';

		items.forEach( function ( item, itemIndex ) {
			var label = item.querySelector( ':scope > .gs-tabs-item__label' );
			var panel = item.querySelector( ':scope > .gs-tabs-item__content' );

			if ( ! label || ! panel ) {
				return;
			}

			var tabId = 'gs-tabs-' + tabsIndex + '-tab-' + itemIndex;
			var panelId = 'gs-tabs-' + tabsIndex + '-panel-' + itemIndex;
			var isActive = 0 === itemIndex;

			label.classList.add( 'gs-tabs__tab' );
			label.setAttribute( 'role', 'tab' );
			label.setAttribute( 'id', tabId );
			label.setAttribute( 'aria-controls', panelId );
			label.setAttribute( 'aria-selected', isActive ? 'true' : 'false' );
			label.setAttribute( 'tabindex', isActive ? '0' : '-1' );

			panel.classList.add( 'gs-tabs__panel' );
			panel.setAttribute( 'role', 'tabpanel' );
			panel.setAttribute( 'id', panelId );
			panel.setAttribute( 'aria-labelledby', tabId );

			if ( ! isActive ) {
				panel.setAttribute( 'hidden', '' );
			}

			tablist.appendChild( label );
			panelsWrap.appendChild( panel );
		} );

		tabsEl.innerHTML = '';
		tabsEl.appendChild( tablist );
		tabsEl.appendChild( panelsWrap );
		tabsEl.classList.add( 'gs-tabs--enhanced' );

		var tabs = Array.prototype.slice.call(
			tablist.querySelectorAll( '.gs-tabs__tab' )
		);

		function activate( tab ) {
			tabs.forEach( function ( candidate ) {
				var panel = document.getElementById(
					candidate.getAttribute( 'aria-controls' )
				);
				var isSelected = candidate === tab;

				candidate.setAttribute(
					'aria-selected',
					isSelected ? 'true' : 'false'
				);
				candidate.setAttribute( 'tabindex', isSelected ? '0' : '-1' );

				if ( panel ) {
					panel.toggleAttribute( 'hidden', ! isSelected );
				}
			} );

			tab.focus();
		}

		tabs.forEach( function ( tab, index ) {
			tab.addEventListener( 'click', function () {
				activate( tab );
			} );

			tab.addEventListener( 'keydown', function ( event ) {
				var newIndex = null;

				if ( nextKey === event.key ) {
					newIndex = ( index + 1 ) % tabs.length;
				} else if ( prevKey === event.key ) {
					newIndex = ( index - 1 + tabs.length ) % tabs.length;
				} else if ( 'Home' === event.key ) {
					newIndex = 0;
				} else if ( 'End' === event.key ) {
					newIndex = tabs.length - 1;
				}

				if ( null !== newIndex ) {
					event.preventDefault();
					activate( tabs[ newIndex ] );
				}
			} );
		} );
	}

	document.querySelectorAll( '.gs-tabs' ).forEach( function ( tabsEl, index ) {
		initTabs( tabsEl, index );
	} );
} )();

// Progressive enhancement — saved markup is plain and readable without
// JS; this builds the interactive tab widget with full ARIA at runtime.
( function () {
	function initTabs( tabsEl, tabsIndex ) {
		const items = Array.prototype.slice.call(
			tabsEl.querySelectorAll( ':scope > .gs-tabs-item' )
		);

		if ( items.length === 0 ) {
			return;
		}

		const isVertical = tabsEl.dataset.style === 'sidebar';
		const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
		const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

		const tablist = document.createElement( 'div' );
		tablist.className = 'gs-tabs__nav';
		tablist.setAttribute( 'role', 'tablist' );
		tablist.setAttribute(
			'aria-orientation',
			isVertical ? 'vertical' : 'horizontal'
		);

		// Panels get their own wrapper (the reference implementation
		// this was adapted from leaves them as loose siblings) so the
		// sidebar variant has a single element to lay out as the
		// second flex column.
		const panelsWrap = document.createElement( 'div' );
		panelsWrap.className = 'gs-tabs__panels';

		items.forEach( function ( item, itemIndex ) {
			const label = item.querySelector( ':scope > .gs-tabs-item__label' );
			const panel = item.querySelector(
				':scope > .gs-tabs-item__content'
			);

			if ( ! label || ! panel ) {
				return;
			}

			const tabId = 'gs-tabs-' + tabsIndex + '-tab-' + itemIndex;
			const panelId = 'gs-tabs-' + tabsIndex + '-panel-' + itemIndex;
			const isActive = 0 === itemIndex;

			label.classList.remove( 'gs-tabs-item__label' );
			label.classList.add( 'gs-tabs__tab' );
			label.setAttribute( 'role', 'tab' );
			label.setAttribute( 'id', tabId );
			label.setAttribute( 'aria-controls', panelId );
			label.setAttribute( 'aria-selected', isActive ? 'true' : 'false' );
			label.setAttribute( 'tabindex', isActive ? '0' : '-1' );

			panel.classList.remove( 'gs-tabs-item__content' );
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

		const tabs = Array.prototype.slice.call(
			tablist.querySelectorAll( '.gs-tabs__tab' )
		);

		function activate( tab ) {
			tabs.forEach( function ( candidate ) {
				const panel = document.getElementById(
					candidate.getAttribute( 'aria-controls' )
				);
				const isSelected = candidate === tab;

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
				let newIndex = null;

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

	document
		.querySelectorAll( '.gs-tabs' )
		.forEach( function ( tabsEl, index ) {
			initTabs( tabsEl, index );
		} );
} )();

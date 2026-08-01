/**
 * Frontend behavior for the Tabs block: switching panels on click, plus
 * keyboard navigation following the WAI-ARIA Tabs Pattern.
 */
document.querySelectorAll( '.wp-block-gamestuff-tabs' ).forEach( ( block ) => {
	const tabs = Array.from( block.querySelectorAll( '[role="tab"]' ) );
	const panels = Array.from( block.querySelectorAll( '[role="tabpanel"]' ) );

	if ( ! tabs.length || tabs.length !== panels.length ) {
		return;
	}

	const isVertical = block.dataset.style === 'sidebar';
	const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
	const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

	function activate( index, focusTab ) {
		tabs.forEach( ( tab, i ) => {
			const active = i === index;
			tab.classList.toggle( 'is-active', active );
			tab.setAttribute( 'aria-selected', String( active ) );
			tab.tabIndex = active ? 0 : -1;
			panels[ i ].classList.toggle( 'is-active', active );
			panels[ i ].toggleAttribute( 'hidden', ! active );
		} );

		if ( focusTab ) {
			tabs[ index ].focus();
		}
	}

	tabs.forEach( ( tab, index ) => {
		tab.addEventListener( 'click', () => activate( index, false ) );

		tab.addEventListener( 'keydown', ( event ) => {
			let target = null;

			if ( event.key === nextKey ) {
				target = ( index + 1 ) % tabs.length;
			} else if ( event.key === prevKey ) {
				target = ( index - 1 + tabs.length ) % tabs.length;
			} else if ( event.key === 'Home' ) {
				target = 0;
			} else if ( event.key === 'End' ) {
				target = tabs.length - 1;
			}

			if ( target !== null ) {
				event.preventDefault();
				activate( target, true );
			}
		} );
	} );
} );
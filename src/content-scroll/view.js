/**
 * GameStuff Content Scroll — frontend behavior.
 *
 * Handles the mobile "more content" arrow: shows it only when the
 * track actually overflows and the user hasn't scrolled to the end
 * yet. The horizontal scroll itself is native (CSS overflow-x), this
 * script only toggles the hint on top of it.
 */
import { isMobileViewport, watchMobileBreakpoint } from '../shared/breakpoint';

document.addEventListener( 'DOMContentLoaded', () => {
	const containers = document.querySelectorAll( '.gs-content-scroll' );

	const updateArrow = ( container ) => {
		const track = container.querySelector( '.gs-cs-track' );
		const arrow = container.querySelector( '.gs-cs-arrow' );

		if ( ! track || ! arrow ) {
			return;
		}

		const hasOverflow = track.scrollWidth > track.clientWidth + 1;

		if ( ! isMobileViewport() || ! hasOverflow ) {
			arrow.classList.add( 'is-hidden' );
			return;
		}

		const atEnd =
			track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;

		arrow.classList.toggle( 'is-hidden', atEnd );
	};

	containers.forEach( ( container ) => {
		const track = container.querySelector( '.gs-cs-track' );

		if ( ! track ) {
			return;
		}

		updateArrow( container );

		track.addEventListener( 'scroll', () => updateArrow( container ), {
			passive: true,
		} );
	} );

	// Same "only react on actual breakpoint crossing" guard as
	// Accordion's view.js, shared via src/shared/breakpoint.js instead
	// of being duplicated in this file.
	watchMobileBreakpoint( () => containers.forEach( updateArrow ) );
} );
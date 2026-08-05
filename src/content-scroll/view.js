// Shows the "more content" arrow only when the track overflows and
// hasn't been scrolled to the end. Scroll itself is native CSS overflow-x.
import { isMobileViewport, watchMobileBreakpoint } from '../shared/breakpoint';

document.addEventListener( 'DOMContentLoaded', () => {
	const containers = document.querySelectorAll( '.gs-content-scroll' );

	const updateArrow = ( container ) => {
		const track = container.querySelector( '.gs-cs-track' );
		const arrow = container.querySelector( '.gs-cs-arrow' );

		if ( ! track || ! arrow ) {
			return;
		}

		// +1px tolerance: browsers can report scrollWidth a
		// sub-pixel larger than clientWidth even when the track
		// isn't actually scrollable, due to rounding during layout.
		const hasOverflow = track.scrollWidth > track.clientWidth + 1;

		if ( ! isMobileViewport() || ! hasOverflow ) {
			arrow.classList.add( 'is-hidden' );
			return;
		}

		// -4px tolerance: same rounding issue as above, this time on
		// the "have we reached the end" check — without it, some
		// browsers/zoom levels never quite hit an exact scrollWidth
		// match and the arrow would stay visible past the real end.
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

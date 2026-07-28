/**
 * GameStuff Accordion — frontend behavior.
 *
 * Collapses each Accordion Item into a toggleable panel on mobile
 * viewports only. On desktop every item stays open and this script
 * has no visible effect.
 */
import { isMobileViewport, watchMobileBreakpoint } from '../shared/breakpoint';

document.addEventListener( 'DOMContentLoaded', () => {
	// Query each item's trigger once, up front, and reuse it below —
	// both the resize-driven state update and the click handler need
	// it, so there's no reason to re-query the DOM for the same
	// element twice.
	const entries = Array.from(
		document.querySelectorAll( '.gs-accordion-item' )
	)
		.map( ( item ) => ( {
			item,
			trigger: item.querySelector( '.gs-accordion-item__trigger' ),
		} ) )
		.filter( ( entry ) => entry.trigger );

	const updateState = () => {
		const mobile = isMobileViewport();

		entries.forEach( ( { item, trigger } ) => {
			item.classList.toggle( 'is-open', ! mobile );
			trigger.setAttribute( 'aria-expanded', ! mobile );
		} );
	};

	updateState();

	// Only reset items when the viewport actually crosses the
	// mobile/desktop boundary, not on every resize event some mobile
	// browsers fire for unrelated reasons (e.g. the address bar
	// hiding or showing). Now shared via src/shared/breakpoint.js
	// instead of being duplicated in this file.
	watchMobileBreakpoint( updateState );

	entries.forEach( ( { item, trigger } ) => {
		trigger.addEventListener( 'click', () => {
			if ( ! isMobileViewport() ) {
				return;
			}

			const opened = item.classList.toggle( 'is-open' );

			trigger.setAttribute( 'aria-expanded', opened );
		} );
	} );
} );

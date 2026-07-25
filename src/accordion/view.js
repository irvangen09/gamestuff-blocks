/**
 * GameStuff Accordion — frontend behavior.
 *
 * Collapses each Accordion Item into a toggleable panel on mobile
 * viewports only. On desktop every item stays open and this script
 * has no visible effect.
 */

const MOBILE_BREAKPOINT = 781;

const isMobileViewport = () => window.innerWidth <= MOBILE_BREAKPOINT;

document.addEventListener( 'DOMContentLoaded', () => {
	const items = document.querySelectorAll( '.gs-accordion-item' );

	const updateState = () => {
		const mobile = isMobileViewport();

		items.forEach( ( item ) => {
			const trigger = item.querySelector(
				'.gs-accordion-item__trigger'
			);

			if ( ! trigger ) {
				return;
			}

			item.classList.toggle( 'is-open', ! mobile );
			trigger.setAttribute( 'aria-expanded', ! mobile );
		} );
	};

	updateState();

	// Only reset items when the viewport actually crosses the
	// mobile/desktop boundary, not on every resize event some mobile
	// browsers fire for unrelated reasons (e.g. the address bar
	// hiding or showing).
	let wasMobile = isMobileViewport();

	window.addEventListener(
		'resize',
		() => {
			const mobile = isMobileViewport();

			if ( mobile === wasMobile ) {
				return;
			}

			wasMobile = mobile;
			updateState();
		},
		{ passive: true }
	);

	items.forEach( ( item ) => {
		const trigger = item.querySelector( '.gs-accordion-item__trigger' );

		if ( ! trigger ) {
			return;
		}

		trigger.addEventListener( 'click', () => {
			if ( ! isMobileViewport() ) {
				return;
			}

			const opened = item.classList.toggle( 'is-open' );

			trigger.setAttribute( 'aria-expanded', opened );
		} );
	} );
} );

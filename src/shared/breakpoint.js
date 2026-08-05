/**
 * Shared mobile-breakpoint detection for GameStuff Blocks frontend
 * scripts, used by accordion/view.js and content-scroll/view.js.
 */

/**
 * Mobile-layout breakpoint, in pixels. Keep in sync with the 781px
 * value in accordion/item, content-scroll, and content-scroll/item
 * style.scss (and shared/tokens.scss on the SCSS side).
 */
export const MOBILE_BREAKPOINT = 781;

/**
 * Whether the current viewport is at or below the mobile breakpoint.
 *
 * @return {boolean} True when the viewport is mobile-width.
 */
export const isMobileViewport = () => window.innerWidth <= MOBILE_BREAKPOINT;

/**
 * Fires `onBreakpointChange` only when the viewport actually crosses
 * the mobile/desktop boundary — not on every `resize` event, which
 * mobile browsers also fire for non-breakpoint reasons (e.g. the
 * address bar hiding/showing) and would otherwise undo state the
 * user just changed.
 *
 * @param {Function} onBreakpointChange Called with the new `isMobile` boolean, only when it changes.
 */
export const watchMobileBreakpoint = ( onBreakpointChange ) => {
	let wasMobile = isMobileViewport();

	const handleResize = () => {
		const mobile = isMobileViewport();

		if ( mobile === wasMobile ) {
			return;
		}

		wasMobile = mobile;
		onBreakpointChange( mobile );
	};

	window.addEventListener( 'resize', handleResize, { passive: true } );
};

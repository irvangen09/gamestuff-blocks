/**
 * Shared mobile-breakpoint detection for GameStuff Blocks frontend
 * scripts.
 *
 * Consolidates logic that was previously duplicated identically in
 * accordion/view.js, and is now also needed by content-scroll/view.js.
 * Behavior is unchanged from the original implementation — this
 * module only centralizes it.
 */

/**
 * Viewport width, in pixels, at and below which GameStuff blocks
 * switch to their mobile layout.
 *
 * Must stay in sync with the `781px` breakpoint used in
 * accordion/item/style.scss, content-scroll/style.scss, and
 * content-scroll/item/style.scss (SCSS can't import a JS constant, so
 * those need to be updated by hand if this value ever changes — see
 * shared/tokens.scss for the SCSS-side equivalent).
 */
export const MOBILE_BREAKPOINT = 781;

/**
 * Whether the current viewport is at or below the mobile breakpoint.
 *
 * @return {boolean} True when the viewport is mobile-width.
 */
export const isMobileViewport = () => window.innerWidth <= MOBILE_BREAKPOINT;

/**
 * Registers a `resize` listener that only invokes `onBreakpointChange`
 * when the viewport actually crosses the mobile/desktop boundary --
 * not on every `resize` event.
 *
 * Without this guard, "resize" events that mobile browsers fire for
 * non-breakpoint reasons (e.g. the address bar hiding/showing when
 * content height changes after a toggle) would re-run the callback
 * and undo state the user just changed.
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

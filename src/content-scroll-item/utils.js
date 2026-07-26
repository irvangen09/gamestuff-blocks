/**
 * Resolves the current attributes into a CSS `aspect-ratio` value.
 * "Custom" is stored as two separate numbers (customRatioWidth /
 * customRatioHeight) rather than a fixed pixel size, so the ratio
 * still scales with whatever column width the desktop grid or
 * mobile scroll card ends up giving this item.
 *
 * Shared between edit.js and save.js so the resolution logic only
 * needs to be correct -- and changed, if it ever needs to change --
 * in one place.
 *
 * @param {string} aspectRatio       One of ASPECT_RATIO_OPTIONS' values, or "custom".
 * @param {number} customRatioWidth  Used only when aspectRatio is "custom".
 * @param {number} customRatioHeight Used only when aspectRatio is "custom".
 * @return {string} A valid CSS `aspect-ratio` value, e.g. "16 / 9".
 */
export function getRatioValue(
	aspectRatio,
	customRatioWidth,
	customRatioHeight
) {
	if ( aspectRatio === 'custom' ) {
		return `${ customRatioWidth } / ${ customRatioHeight }`;
	}

	return aspectRatio.replace( '/', ' / ' );
}
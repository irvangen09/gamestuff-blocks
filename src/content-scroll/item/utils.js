/**
 * Resolves attributes into a CSS `aspect-ratio` value. Shared between
 * edit.js and save.js so the logic stays in one place.
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

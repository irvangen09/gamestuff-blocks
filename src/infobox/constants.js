/**
 * Character Infobox — local constants.
 *
 * Kept local to this block (not in src/shared/) because these values
 * are only used by the Character Infobox portrait upload control,
 * unlike the mobile breakpoint in src/shared/breakpoint.js which is
 * genuinely shared across multiple blocks.
 */

/**
 * Character portrait frame size (width x height, in pixels).
 *
 * Must stay in sync with the `add_image_size( 'gamestuff_character',
 * 270, 360, false )` call in includes/Blocks/Infobox/Infobox.php and
 * the portrait frame dimensions in style.scss and editor.scss (SCSS
 * and PHP can't import a JS constant, so those need to be updated by
 * hand if this value ever changes).
 */
export const PORTRAIT_WIDTH = 270;
export const PORTRAIT_HEIGHT = 360;

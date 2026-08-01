import { InnerBlocks } from '@wordpress/block-editor';

/**
 * No wrapper element on purpose. The "label" attribute is intentionally
 * left out of the saved markup entirely (see edit.js) — TabsRenderer
 * (PHP) reads it directly from block data and builds the actual nav
 * button and <div role="tabpanel"> wrapper itself, with the id/aria
 * attributes that depend on this item's position among its siblings.
 *
 * Returning bare InnerBlocks.Content here means render_block() on this
 * block (called from TabsRenderer) yields exactly this tab's content,
 * with nothing extra to unwrap.
 */
export default function save() {
	return <InnerBlocks.Content />;
}
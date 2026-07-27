import { RichText, useBlockProps } from '@wordpress/block-editor';

import { getRatioValue } from './utils';

export default function save( { attributes } ) {
	const {
		imageUrl,
		imageAlt,
		title,
		url,
		aspectRatio,
		scale,
		customRatioWidth,
		customRatioHeight,
		cardClickable,
	} = attributes;

	const hasUrl = !! url;
	const hasTitle = !! title;
	const asCardLink = cardClickable && hasUrl;

	const ratioValue = getRatioValue(
		aspectRatio,
		customRatioWidth,
		customRatioHeight
	);

	const thumb = !! imageUrl && (
		<div className="gs-cs-thumb" style={ { aspectRatio: ratioValue } }>
			<img
				src={ imageUrl }
				alt={ imageAlt }
				style={ { objectFit: scale } }
			/>
		</div>
	);

	const blockProps = useBlockProps.save( {
		className: 'gs-cs-item',
		/*
		 * Safari drops the implicit "list"/"listitem" accessibility
		 * role from <ul>/<li> when list-style: none is applied (a
		 * long-documented WebKit behavior, not a bug in this markup).
		 * Since .gs-cs-track needs list-style: none to remove the
		 * default bullet, role="list" is set there and role="listitem"
		 * here to keep the list semantics intact in every browser —
		 * see the matching role="list" on the parent in
		 * content-scroll/save.js.
		 */
		role: 'listitem',
	} );

	/*
	 * Whole card is the link: the <li> itself is the list item, and
	 * everything clickable lives inside a single inner <a>. Title
	 * renders as plain text inside it (see "Entire Card Clickable" on
	 * the parent block).
	 */
	if ( asCardLink ) {
		return (
			<li { ...blockProps }>
				<a
					className="gs-cs-item__link"
					href={ url }
					aria-label={
						/*
						 * Show Image / Show Title (parent-level toggles)
						 * only hide these visually via CSS — the markup
						 * itself is unchanged, so the title text is still
						 * in the DOM either way. Without this, turning
						 * both toggles off at once on the parent would
						 * leave the anchor with no accessible content at
						 * all for screen reader / keyboard users, even
						 * though a title exists in the data.
						 */
						hasTitle ? title.replace( /<[^>]*>/g, '' ) : undefined
					}
				>
					{ thumb }

					{ hasTitle && (
						<RichText.Content
							tagName="div"
							className="gs-cs-title"
							value={ title }
						/>
					) }
				</a>
			</li>
		);
	}

	/*
	 * Only the title links out (or nothing does, if this item has
	 * no URL at all) — thumbnail is never wrapped in its own anchor
	 * in that case, since a title-only link with a separate,
	 * identically-targeted image link would be a redundant tab stop
	 * for keyboard/screen reader users.
	 */
	return (
		<li { ...blockProps }>
			{ thumb }

			{ hasTitle && hasUrl && (
				<RichText.Content
					tagName="a"
					className="gs-cs-title"
					href={ url }
					value={ title }
				/>
			) }

			{ hasTitle && ! hasUrl && (
				<RichText.Content
					tagName="div"
					className="gs-cs-title"
					value={ title }
				/>
			) }
		</li>
	);
}

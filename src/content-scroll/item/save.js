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
				loading="lazy"
			/>
		</div>
	);

	const blockProps = useBlockProps.save( {
		className: 'gs-cs-item',
		// Safari drops implicit list/listitem roles when list-style:
		// none is applied — role="listitem" restores it here.
		role: 'listitem',
	} );

	// Whole card is the link — everything clickable lives inside one
	// inner <a>; title renders as plain text inside it.
	if ( asCardLink ) {
		return (
			<li { ...blockProps }>
				<a
					className="gs-cs-item__link"
					href={ url }
					aria-label={
						// Title text stays in the DOM even when Show
						// Title is off (CSS-only hide) — keeps the
						// anchor accessible with both toggles off.
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

	// Only the title links (thumbnail never gets its own anchor here)
	// to avoid a redundant tab stop for the same destination.
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

import { RichText, useBlockProps } from '@wordpress/block-editor';

import { getRatioValue } from './utils';

/**
 * v1: root element was <a class="gs-cs-item"> (whole card clickable)
 * or <div class="gs-cs-item"> (title-only link), matching whatever
 * .gs-cs-track (the parent) rendered as at the time — a plain <div>.
 *
 * Kept so Content Scroll Items published before the accessibility
 * revision (root changed to <li>, with an inner
 * <a class="gs-cs-item__link"> for the whole-card-link case, to give
 * the collection of cards proper list semantics for screen readers,
 * matching content-scroll's matching <ul role="list"> change) still
 * validate correctly and don't show "block contains invalid content"
 * in the editor. Attributes are unchanged from the active version —
 * only the saved markup shape differs.
 */
const v1 = {
	attributes: {
		imageId: {
			type: 'number',
			default: 0,
		},
		imageUrl: {
			type: 'string',
			default: '',
		},
		imageAlt: {
			type: 'string',
			default: '',
		},
		title: {
			type: 'string',
			default: '',
		},
		url: {
			type: 'string',
			default: '',
		},
		aspectRatio: {
			type: 'string',
			default: '4/3',
		},
		scale: {
			type: 'string',
			default: 'cover',
		},
		customRatioWidth: {
			type: 'number',
			default: 4,
		},
		customRatioHeight: {
			type: 'number',
			default: 3,
		},
		cardClickable: {
			type: 'boolean',
			default: true,
		},
	},

	supports: {
		html: false,
		reusable: false,
	},

	save( { attributes } ) {
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
		} );

		if ( asCardLink ) {
			return (
				<a
					{ ...blockProps }
					href={ url }
					aria-label={
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
			);
		}

		return (
			<div { ...blockProps }>
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
			</div>
		);
	},
};

export default [ v1 ];
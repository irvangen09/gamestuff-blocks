import { RichText, useBlockProps } from '@wordpress/block-editor';

import { getRatioValue } from './utils';

// v1: root was <a>/<div class="gs-cs-item"> (pre-<li> markup, before
// the list-semantics revision). Attributes unchanged from active version.
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

// v2: identical to active version, minus loading="lazy" on the <img>.
const v2 = {
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
			role: 'listitem',
		} );

		if ( asCardLink ) {
			return (
				<li { ...blockProps }>
					<a
						className="gs-cs-item__link"
						href={ url }
						aria-label={
							hasTitle
								? title.replace( /<[^>]*>/g, '' )
								: undefined
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
	},
};

export default [ v2, v1 ];

import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';

// v2: had an icon field (dashicon class name + color), removed
// because no content on the site actually used a custom icon.
const v2 = {
	attributes: {
		title: {
			type: 'string',
			default: '',
		},
		headingLevel: {
			type: 'string',
			default: 'h2',
		},
		icon: {
			type: 'string',
			default: 'dashicons-media-document',
		},
		iconColor: {
			type: 'string',
			default: '#ff5a1f',
		},
		triggerId: {
			type: 'string',
			source: 'attribute',
			selector: '.gs-accordion-item__trigger',
			attribute: 'id',
			default: '',
		},
		panelId: {
			type: 'string',
			source: 'attribute',
			selector: '.gs-accordion-item__content',
			attribute: 'id',
			default: '',
		},
	},

	supports: {
		html: false,
		reusable: false,
	},

	save( { attributes } ) {
		const { title, icon, iconColor, headingLevel, triggerId, panelId } =
			attributes;

		const blockProps = useBlockProps.save( {
			className: 'gs-accordion-item',
		} );

		const HeadingTag = headingLevel || 'h2';

		return (
			<div { ...blockProps }>
				<HeadingTag className="gs-accordion-item__heading">
					<button
						id={ triggerId }
						type="button"
						className="gs-accordion-item__trigger"
						aria-expanded="false"
						aria-controls={ panelId }
					>
						<span
							className={ `gs-accordion-item__icon dashicons ${ icon }` }
							style={ { color: iconColor } }
							aria-hidden="true"
						/>

						<span className="gs-accordion-item__title">
							<RichText.Content value={ title } />
						</span>

						<span
							className="gs-accordion-item__chevron"
							aria-hidden="true"
						>
							▾
						</span>
					</button>
				</HeadingTag>

				<div
					id={ panelId }
					className="gs-accordion-item__content"
					role="region"
					aria-labelledby={ triggerId }
				>
					<InnerBlocks.Content />
				</div>
			</div>
		);
	},
};

// v1: icon was a bare dashicon name (rendered as `dashicons-${icon}`);
// iconColor was never applied on the frontend.
const v1 = {
	attributes: {
		title: {
			type: 'string',
			default: '',
		},
		headingLevel: {
			type: 'string',
			default: 'h2',
		},
		icon: {
			type: 'string',
			default: 'media-document',
		},
		iconColor: {
			type: 'string',
			default: '#ff5a1f',
		},
		// Read from existing markup so pre-icon-rename content's
		// clientId-based id validates instead of regenerating a new one.
		triggerId: {
			type: 'string',
			source: 'attribute',
			selector: '.gs-accordion-item__trigger',
			attribute: 'id',
			default: '',
		},
		panelId: {
			type: 'string',
			source: 'attribute',
			selector: '.gs-accordion-item__content',
			attribute: 'id',
			default: '',
		},
	},

	supports: {
		html: false,
		reusable: false,
	},

	save( { attributes } ) {
		const { title, icon, headingLevel, triggerId, panelId } = attributes;

		const blockProps = useBlockProps.save( {
			className: 'gs-accordion-item',
		} );

		const HeadingTag = headingLevel || 'h2';

		return (
			<div { ...blockProps }>
				<HeadingTag className="gs-accordion-item__heading">
					<button
						id={ triggerId }
						type="button"
						className="gs-accordion-item__trigger"
						aria-expanded="false"
						aria-controls={ panelId }
					>
						<span
							className={ `gs-accordion-item__icon dashicons dashicons-${ icon }` }
							aria-hidden="true"
						/>

						<span className="gs-accordion-item__title">
							<RichText.Content value={ title } />
						</span>

						<span
							className="gs-accordion-item__chevron"
							aria-hidden="true"
						>
							▾
						</span>
					</button>
				</HeadingTag>

				<div
					id={ panelId }
					className="gs-accordion-item__content"
					role="region"
					aria-labelledby={ triggerId }
				>
					<InnerBlocks.Content />
				</div>
			</div>
		);
	},

	// Migrate old bare icon names to the new class-name format so
	// existing content keeps showing the right icon once it's
	// resaved.
	migrate( attributes ) {
		const { icon } = attributes;

		if ( icon && ! icon.startsWith( 'dashicons-' ) ) {
			return {
				...attributes,
				icon: `dashicons-${ icon }`,
			};
		}

		return attributes;
	},
};

export default [ v2, v1 ];
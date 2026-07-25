import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';

/**
 * v1: icon was a bare dashicon name (e.g. "media-document"), rendered
 * as `dashicons-${icon}`, and iconColor was never applied on the
 * frontend output.
 *
 * Kept so accordion items published before the icon field became a
 * free-text class name still validate correctly and don't show
 * "block contains invalid content" in the editor.
 */
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
		// Sourced from the already-saved markup, same as the active
		// version — this lets pre-icon-rename content (which still
		// has a clientId-based id literally baked into its stored
		// HTML) validate correctly by reading that existing id back
		// out, instead of trying to regenerate it from a fresh (and
		// different) clientId.
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

export default [ v1 ];

import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

// v1: track wrapper was a plain <div class="gs-cs-track"> (pre-<ul
// role="list"> markup). Attributes unchanged from active version.
const v1 = {
	attributes: {
		desktopColumns: {
			type: 'number',
			default: 3,
		},
		gap: {
			type: 'number',
			default: 24,
		},
		borderRadius: {
			type: 'number',
			default: 8,
		},
		showImage: {
			type: 'boolean',
			default: true,
		},
		showTitle: {
			type: 'boolean',
			default: true,
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
		const { desktopColumns, gap, borderRadius, showImage, showTitle } =
			attributes;

		const wrapperClassName = [
			'gs-content-scroll',
			! showImage && 'gs-content-scroll--hide-image',
			! showTitle && 'gs-content-scroll--hide-title',
		]
			.filter( Boolean )
			.join( ' ' );

		const blockProps = useBlockProps.save( {
			className: wrapperClassName,
			style: {
				'--gs-cs-cols': desktopColumns,
				'--gs-cs-gap': `${ gap }px`,
				'--gs-cs-radius': `${ borderRadius }px`,
			},
		} );

		return (
			<div { ...blockProps }>
				<div className="gs-cs-track">
					<InnerBlocks.Content />
				</div>

				<span className="gs-cs-arrow" aria-hidden="true">
					&#8250;
				</span>
			</div>
		);
	},
};

export default [ v1 ];

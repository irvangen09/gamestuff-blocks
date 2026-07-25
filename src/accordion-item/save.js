import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
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
}

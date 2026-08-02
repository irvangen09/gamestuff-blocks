import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
	const { title } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'gs-timeline-item',
	} );

	return (
		<li { ...blockProps }>
			<span className="gs-timeline-item__node" aria-hidden="true" />
			<div className="gs-timeline-item__content">
				<RichText.Content
					tagName="p"
					className="gs-timeline-item__title"
					value={ title }
				/>
				<div className="gs-timeline-item__body">
					<InnerBlocks.Content />
				</div>
			</div>
		</li>
	);
}

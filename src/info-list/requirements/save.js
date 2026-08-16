import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { title } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'gs-info-list-requirements',
	} );

	return (
		<div { ...blockProps }>
			<div className="gs-info-list-requirements-title">
				<span
					className="dashicons dashicons-yes-alt"
					aria-hidden="true"
				/>

				<RichText.Content value={ title } />
			</div>

			<ul className="gs-info-list-requirements-list">
				<InnerBlocks.Content />
			</ul>
		</div>
	);
}
import { __ } from '@wordpress/i18n';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save() {
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

				{ __( 'Requirements', 'gamestuff-blocks' ) }
			</div>

			<ul className="gs-info-list-requirements-list">
				<InnerBlocks.Content />
			</ul>
		</div>
	);
}
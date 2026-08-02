import { __ } from '@wordpress/i18n';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [ 'gamestuff/info-list-requirement' ];

const TEMPLATE = [ [ 'gamestuff/info-list-requirement' ] ];

export default function Edit() {
	const blockProps = useBlockProps( {
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
				<InnerBlocks
					allowedBlocks={ ALLOWED_BLOCKS }
					template={ TEMPLATE }
					templateLock={ false }
				/>
			</ul>
		</div>
	);
}
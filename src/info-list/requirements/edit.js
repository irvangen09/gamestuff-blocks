import { __ } from '@wordpress/i18n';
import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [ 'gamestuff/info-list-requirement' ];

const TEMPLATE = [ [ 'gamestuff/info-list-requirement' ] ];

export default function Edit( { attributes, setAttributes } ) {
	const { title } = attributes;

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

				<RichText
					tagName="span"
					value={ title }
					onChange={ ( newTitle ) =>
						setAttributes( { title: newTitle } )
					}
					placeholder={ __( 'Requirements', 'gamestuff-blocks' ) }
					allowedFormats={ [] }
				/>
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

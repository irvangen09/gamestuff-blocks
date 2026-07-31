import { __ } from '@wordpress/i18n';

import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';

import { PanelBody, TextControl } from '@wordpress/components';

export default function Edit( { attributes, setAttributes } ) {
	const { icon, text } = attributes;

	const blockProps = useBlockProps( {
		className: 'gs-info-list-requirement',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Requirement Settings', 'gamestuff-blocks' ) }
				>
					<TextControl
						label={ __( 'Icon', 'gamestuff-blocks' ) }
						value={ icon }
						onChange={ ( newIcon ) =>
							setAttributes( {
								icon: newIcon,
							} )
						}
						placeholder="dashicons-yes"
						help={ __(
							"Dashicons class name, e.g. dashicons-yes. Leave empty if this item doesn't need an icon.",
							'gamestuff-blocks'
						) }
						__next40pxDefaultSize
					/>
				</PanelBody>
			</InspectorControls>

			<li { ...blockProps }>
				{ icon && (
					<span
						className={ `dashicons ${ icon }` }
						aria-hidden="true"
					/>
				) }

				<RichText
					tagName="span"
					value={ text }
					onChange={ ( newText ) =>
						setAttributes( {
							text: newText,
						} )
					}
					placeholder={ __(
						'Requirement…',
						'gamestuff-blocks'
					) }
					allowedFormats={ [
						'core/bold',
						'core/italic',
						'core/link',
					] }
				/>
			</li>
		</>
	);
}
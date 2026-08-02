import { __ } from '@wordpress/i18n';

import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';

import { PanelBody, TextControl } from '@wordpress/components';

export default function Edit( { attributes, setAttributes } ) {
	const { icon, label, value } = attributes;

	const blockProps = useBlockProps( {
		className: 'gs-row',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Field Settings', 'gamestuff-blocks' ) }>
					<TextControl
						label={ __( 'Icon', 'gamestuff-blocks' ) }
						value={ icon }
						onChange={ ( newIcon ) =>
							setAttributes( {
								icon: newIcon,
							} )
						}
						placeholder="dashicons-calendar-alt"
						help={ __(
							"Dashicons class name, e.g. dashicons-calendar-alt. Leave empty if this field doesn't need an icon.",
							'gamestuff-blocks'
						) }
						__next40pxDefaultSize
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="gs-row-label">
					{ icon && (
						<span
							className={ `dashicons ${ icon }` }
							aria-hidden="true"
						/>
					) }

					<RichText
						tagName="span"
						className="gs-row-label-text"
						value={ label }
						onChange={ ( newLabel ) =>
							setAttributes( {
								label: newLabel,
							} )
						}
						placeholder={ __( 'Label', 'gamestuff-blocks' ) }
						allowedFormats={ [] }
					/>
				</div>

				<RichText
					tagName="div"
					className="gs-row-value gs-richtext"
					value={ value }
					onChange={ ( newValue ) =>
						setAttributes( {
							value: newValue,
						} )
					}
					placeholder={ __( 'Value', 'gamestuff-blocks' ) }
					allowedFormats={ [
						'core/bold',
						'core/italic',
						'core/link',
					] }
				/>
			</div>
		</>
	);
}

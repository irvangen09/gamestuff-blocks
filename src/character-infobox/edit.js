/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	InnerBlocks,
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';

import './editor.scss';
import PortraitUpload from './portrait-upload';

const HEADING_LEVELS = [
	{ label: 'H2', value: 'h2' },
	{ label: 'H3', value: 'h3' },
	{ label: 'H4', value: 'h4' },
	{ label: 'H5', value: 'h5' },
	{ label: 'H6', value: 'h6' },
];

const ALLOWED_BLOCKS = [ 'gamestuff/character-infobox-field' ];

const TEMPLATE = [ [ 'gamestuff/character-infobox-field' ] ];

export default function Edit( { attributes, setAttributes } ) {
	const { characterName, headingLevel, portraitId, portraitUrl } = attributes;

	/**
	 * The portrait URL/alt are captured directly from the Media Library
	 * selection (not looked up again later) so that save() stays a pure
	 * function of attributes — required for a Static Block, since save()
	 * cannot reach into the REST API / data store the way a dynamic
	 * render.php could reach into wp_get_attachment_image().
	 *
	 * @param {Object} media Media object selected from the Media Library.
	 */
	const onSelectImage = ( media ) => {
		setAttributes( {
			portraitId: media.id,
			portraitUrl:
				media.sizes?.gamestuff_character?.url ||
				media.sizes?.full?.url ||
				media.url,
			portraitAlt: media.alt || '',
		} );
	};

	const removeImage = () => {
		setAttributes( {
			portraitId: 0,
			portraitUrl: '',
			portraitAlt: '',
		} );
	};

	return (
		<div { ...useBlockProps() }>
			<InspectorControls>
				<PanelBody title={ __( 'Character Name', 'gamestuff-blocks' ) }>
					<SelectControl
						label={ __( 'Heading Level', 'gamestuff-blocks' ) }
						value={ headingLevel }
						options={ HEADING_LEVELS }
						onChange={ ( newLevel ) =>
							setAttributes( { headingLevel: newLevel } )
						}
						__next40pxDefaultSize
					/>
				</PanelBody>
			</InspectorControls>

			<div className="gs-character">
				<div className="gs-character-card">
					<div className="gs-character-portrait-wrap">
						<PortraitUpload
							portraitId={ portraitId }
							portraitUrl={ portraitUrl }
							onSelectImage={ onSelectImage }
							removeImage={ removeImage }
						/>
					</div>

					<div className="gs-character-panel">
						<div className="gs-character-summary">
							<div className="gs-summary-main">
								<RichText
									tagName={ headingLevel }
									className="gs-character-name"
									value={ characterName }
									onChange={ ( value ) =>
										setAttributes( {
											characterName: value,
										} )
									}
									placeholder={ __(
										'Character Name',
										'gamestuff-blocks'
									) }
									allowedFormats={ [] }
								/>
							</div>
						</div>

						<dl className="gs-character-rows">
							<InnerBlocks
								allowedBlocks={ ALLOWED_BLOCKS }
								template={ TEMPLATE }
								templateLock={ false }
							/>
						</dl>
					</div>
				</div>
			</div>
		</div>
	);
}

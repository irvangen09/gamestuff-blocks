import { __ } from '@wordpress/i18n';

import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';

import {
	Button,
	PanelBody,
	SelectControl,
	TextControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalNumberControl as NumberControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

import './editor.scss';

import { getRatioValue } from './utils';

const ASPECT_RATIO_OPTIONS = [
	{ label: __( 'Square — 1:1', 'gamestuff-blocks' ), value: '1/1' },
	{ label: __( 'Landscape — 16:9', 'gamestuff-blocks' ), value: '16/9' },
	{ label: __( 'Standard — 4:3', 'gamestuff-blocks' ), value: '4/3' },
	{ label: __( 'Portrait — 3:4', 'gamestuff-blocks' ), value: '3/4' },
	{ label: __( 'Classic — 3:2', 'gamestuff-blocks' ), value: '3/2' },
	{ label: __( 'Tall — 2:3', 'gamestuff-blocks' ), value: '2/3' },
	{ label: __( 'Custom', 'gamestuff-blocks' ), value: 'custom' },
];

export default function Edit( { attributes, setAttributes } ) {
	const {
		imageId,
		imageUrl,
		imageAlt,
		title,
		url,
		aspectRatio,
		scale,
		customRatioWidth,
		customRatioHeight,
	} = attributes;

	const onSelectImage = ( media ) => {
		setAttributes( {
			imageId: media.id,
			imageUrl:
				media.sizes?.medium?.url || media.sizes?.full?.url || media.url,
			imageAlt: media.alt || '',
		} );
	};

	const removeImage = () => {
		setAttributes( { imageId: 0, imageUrl: '', imageAlt: '' } );
	};

	const ratioValue = getRatioValue(
		aspectRatio,
		customRatioWidth,
		customRatioHeight
	);

	const blockProps = useBlockProps( {
		className: 'gs-cs-item-edit',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Image', 'gamestuff-blocks' ) }>
					<TextControl
						label={ __( 'Alt Text', 'gamestuff-blocks' ) }
						value={ imageAlt }
						onChange={ ( value ) =>
							setAttributes( { imageAlt: value } )
						}
						help={ __(
							'Leave empty if the image is purely decorative.',
							'gamestuff-blocks'
						) }
						__next40pxDefaultSize
					/>

					<SelectControl
						label={ __( 'Aspect Ratio', 'gamestuff-blocks' ) }
						value={ aspectRatio }
						options={ ASPECT_RATIO_OPTIONS }
						onChange={ ( value ) =>
							setAttributes( { aspectRatio: value } )
						}
						__next40pxDefaultSize
					/>

					{ aspectRatio === 'custom' && (
						<div className="gs-cs-custom-ratio">
							<NumberControl
								label={ __( 'Width', 'gamestuff-blocks' ) }
								value={ customRatioWidth }
								onChange={ ( value ) =>
									setAttributes( {
										customRatioWidth: Number( value ) || 1,
									} )
								}
								min={ 1 }
								__next40pxDefaultSize
							/>

							<NumberControl
								label={ __( 'Height', 'gamestuff-blocks' ) }
								value={ customRatioHeight }
								onChange={ ( value ) =>
									setAttributes( {
										customRatioHeight: Number( value ) || 1,
									} )
								}
								min={ 1 }
								__next40pxDefaultSize
							/>
						</div>
					) }

					<ToggleGroupControl
						label={ __( 'Scale', 'gamestuff-blocks' ) }
						value={ scale }
						onChange={ ( value ) =>
							setAttributes( { scale: value } )
						}
						isBlock
						__next40pxDefaultSize
					>
						<ToggleGroupControlOption
							value="cover"
							label={ __( 'Cover', 'gamestuff-blocks' ) }
						/>
						<ToggleGroupControlOption
							value="contain"
							label={ __( 'Contain', 'gamestuff-blocks' ) }
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<MediaUploadCheck>
					<MediaUpload
						onSelect={ onSelectImage }
						allowedTypes={ [ 'image' ] }
						value={ imageId }
						render={ ( { open } ) => (
							<div
								className="gs-cs-item-edit__thumb"
								style={ { aspectRatio: ratioValue } }
								role="button"
								tabIndex={ 0 }
								onClick={ open }
								onKeyDown={ ( event ) => {
									if (
										event.key === 'Enter' ||
										event.key === ' '
									) {
										open();
									}
								} }
							>
								{ imageUrl ? (
									<img
										src={ imageUrl }
										alt=""
										style={ { objectFit: scale } }
									/>
								) : (
									<span className="dashicons dashicons-camera" />
								) }
							</div>
						) }
					/>
				</MediaUploadCheck>

				{ imageId > 0 && (
					<Button
						variant="link"
						isDestructive
						className="gs-cs-item-edit__remove-image"
						onClick={ removeImage }
					>
						{ __( 'Remove Image', 'gamestuff-blocks' ) }
					</Button>
				) }

				<RichText
					tagName="div"
					className="gs-cs-item-edit__title"
					value={ title }
					onChange={ ( value ) => setAttributes( { title: value } ) }
					placeholder={ __( 'Title…', 'gamestuff-blocks' ) }
					allowedFormats={ [] }
				/>

				<TextControl
					className="gs-cs-item-edit__url"
					label={ __( 'URL', 'gamestuff-blocks' ) }
					value={ url }
					onChange={ ( value ) => setAttributes( { url: value } ) }
					placeholder={ __(
						'/destination-page/',
						'gamestuff-blocks'
					) }
					type="url"
					__next40pxDefaultSize
				/>
			</div>
		</>
	);
}

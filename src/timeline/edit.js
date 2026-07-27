import { __ } from '@wordpress/i18n';
import {
	InnerBlocks,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

import { TIMELINE_TYPES, DEFAULT_TIMELINE_TYPE } from './constants';

const ALLOWED_BLOCKS = [ 'gamestuff/timeline-item' ];

const TEMPLATE = [ [ 'gamestuff/timeline-item' ] ];

export default function Edit( { attributes, setAttributes } ) {
	const { timelineType } = attributes;

	const TagName =
		TIMELINE_TYPES[ timelineType ]?.tag ||
		TIMELINE_TYPES[ DEFAULT_TIMELINE_TYPE ].tag;

	const blockProps = useBlockProps( {
		className: `gs-timeline gs-timeline--${ timelineType }`,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Timeline Settings', 'gamestuff-blocks' ) }
				>
					<ToggleGroupControl
						label={ __( 'Timeline Type', 'gamestuff-blocks' ) }
						value={ timelineType }
						onChange={ ( value ) =>
							setAttributes( { timelineType: value } )
						}
						isBlock
						__next40pxDefaultSize
					>
						{ Object.entries( TIMELINE_TYPES ).map(
							( [ value, config ] ) => (
								<ToggleGroupControlOption
									key={ value }
									value={ value }
									label={ config.label }
								/>
							)
						) }
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>
			<TagName { ...blockProps }>
				<InnerBlocks
					allowedBlocks={ ALLOWED_BLOCKS }
					template={ TEMPLATE }
					templateLock={ false }
				/>
			</TagName>
		</>
	);
}

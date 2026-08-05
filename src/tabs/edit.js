import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	// eslint-disable-next-line camelcase
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line camelcase
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

const ALLOWED_BLOCKS = [ 'gamestuff/tabs-item' ];

const TEMPLATE = [
	[ 'gamestuff/tabs-item' ],
	[ 'gamestuff/tabs-item' ],
];

// Editor shows every Tab Item in full sequence, not as a live tab
// widget — real switching only exists on the frontend (view.js).
export default function Edit( { attributes, setAttributes } ) {
	const { style } = attributes;

	const blockProps = useBlockProps( {
		className: 'gs-tabs',
		'data-style': style,
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		templateLock: false,
		orientation: 'horizontal',
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Style', 'gamestuff-blocks' ) }>
					<ToggleGroupControl
						label={ __( 'Tab Style', 'gamestuff-blocks' ) }
						value={ style }
						isBlock
						onChange={ ( value ) => setAttributes( { style: value } ) }
					>
						<ToggleGroupControlOption
							value="underline"
							label={ __( 'Underline', 'gamestuff-blocks' ) }
						/>
						<ToggleGroupControlOption
							value="sidebar"
							label={ __( 'Sidebar', 'gamestuff-blocks' ) }
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}

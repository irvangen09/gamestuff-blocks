import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';

import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	ToggleControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

import './editor.scss';

const ALLOWED_BLOCKS = [ 'gamestuff/content-scroll-item' ];

const TEMPLATE = [
	[ 'gamestuff/content-scroll-item' ],
	[ 'gamestuff/content-scroll-item' ],
];

const COLUMN_OPTIONS = [ 2, 3, 4, 5 ];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const {
		desktopColumns,
		gap,
		borderRadius,
		showImage,
		showTitle,
		cardClickable,
	} = attributes;

	const innerBlocks = useSelect(
		( select ) => select( blockEditorStore ).getBlocks( clientId ),
		[ clientId ]
	);

	const { updateBlockAttributes } = useDispatch( blockEditorStore );

	/**
	 * "Entire Card Clickable" changes which element becomes the <a>
	 * in each item's frontend markup (see content-scroll/item/save.js),
	 * so it has to live as an attribute on every child block — save()
	 * only ever has access to its own block's attributes, never a
	 * parent's. Pushing this single Inspector toggle down to every
	 * current child keeps it feeling like one setting from the
	 * editor's point of view, while every item still produces valid,
	 * self-contained static markup on its own.
	 */
	useEffect( () => {
		innerBlocks.forEach( ( block ) => {
			if ( block.attributes.cardClickable !== cardClickable ) {
				updateBlockAttributes( block.clientId, {
					cardClickable,
				} );
			}
		} );
	}, [ cardClickable, innerBlocks, updateBlockAttributes ] );

	const wrapperClassName = [
		'gs-content-scroll',
		! showImage && 'gs-content-scroll--hide-image',
		! showTitle && 'gs-content-scroll--hide-title',
	]
		.filter( Boolean )
		.join( ' ' );

	const blockProps = useBlockProps( {
		className: wrapperClassName,
		style: {
			'--gs-cs-cols': desktopColumns,
			'--gs-cs-gap': `${ gap }px`,
			'--gs-cs-radius': `${ borderRadius }px`,
		},
	} );

	/**
	 * Replaces the legacy <InnerBlocks /> component. That component
	 * renders its own extra `.block-editor-inner-blocks` /
	 * `.block-editor-block-list__layout` wrapper pair around the
	 * child blocks, so `.gs-cs-track` was never the direct grid
	 * parent of each card in the editor — only of that wrapper.
	 * useInnerBlocksProps() merges the inner-blocks wrapper directly
	 * onto `.gs-cs-track` itself instead of introducing a nested
	 * wrapper, so each card becomes a direct child of `.gs-cs-track`
	 * in the editor, matching the frontend markup produced by
	 * `<InnerBlocks.Content />` in save.js exactly.
	 */
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'gs-cs-track' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateLock: false,
			orientation: 'horizontal',
		}
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Layout', 'gamestuff-blocks' ) }>
					<ToggleGroupControl
						label={ __( 'Desktop Columns', 'gamestuff-blocks' ) }
						value={ desktopColumns }
						onChange={ ( value ) =>
							setAttributes( {
								desktopColumns: Number( value ),
							} )
						}
						isBlock
						__next40pxDefaultSize
					>
						{ COLUMN_OPTIONS.map( ( cols ) => (
							<ToggleGroupControlOption
								key={ cols }
								value={ cols }
								label={ String( cols ) }
							/>
						) ) }
					</ToggleGroupControl>

					<RangeControl
						label={ __( 'Gap', 'gamestuff-blocks' ) }
						value={ gap }
						onChange={ ( value ) =>
							setAttributes( { gap: value } )
						}
						min={ 0 }
						max={ 60 }
						step={ 4 }
						__next40pxDefaultSize
					/>

					<RangeControl
						label={ __( 'Border Radius', 'gamestuff-blocks' ) }
						value={ borderRadius }
						onChange={ ( value ) =>
							setAttributes( { borderRadius: value } )
						}
						min={ 0 }
						max={ 32 }
						step={ 2 }
						__next40pxDefaultSize
					/>
				</PanelBody>

				<PanelBody title={ __( 'Display', 'gamestuff-blocks' ) }>
					<ToggleControl
						label={ __( 'Show Image', 'gamestuff-blocks' ) }
						checked={ showImage }
						onChange={ ( value ) =>
							setAttributes( { showImage: value } )
						}
					/>

					<ToggleControl
						label={ __( 'Show Title', 'gamestuff-blocks' ) }
						checked={ showTitle }
						onChange={ ( value ) =>
							setAttributes( { showTitle: value } )
						}
					/>

					<ToggleControl
						label={ __(
							'Entire Card Clickable',
							'gamestuff-blocks'
						) }
						help={ __(
							'When off, only the title becomes a link.',
							'gamestuff-blocks'
						) }
						checked={ cardClickable }
						onChange={ ( value ) =>
							setAttributes( { cardClickable: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div { ...innerBlocksProps } />

				<span className="gs-cs-arrow" aria-hidden="true">
					&#8250;
				</span>
			</div>
		</>
	);
}

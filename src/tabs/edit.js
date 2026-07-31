import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	// eslint-disable-next-line camelcase
	__experimentalToggleGroupControl as ToggleGroupControl,
	// eslint-disable-next-line camelcase
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

const ALLOWED_BLOCKS = [ 'gamestuff/tabs-item' ];

const TEMPLATE = [
	[ 'gamestuff/tabs-item', { label: __( 'Tab 1', 'gamestuff-blocks' ) } ],
	[ 'gamestuff/tabs-item', { label: __( 'Tab 2', 'gamestuff-blocks' ) } ],
];

/**
 * Editor preview only needs to show ONE panel at a time so it matches the
 * final frontend output (see PROJECT concept notes). Since every child
 * "tabs-item" block renders its own DOM wrapper, the active panel is
 * selected with a small scoped stylesheet rather than by unmounting the
 * inactive ones — this keeps their block state (selection, inner content)
 * intact when switching preview.
 */
export default function Edit( { attributes, setAttributes, clientId } ) {
	const { style, activeTab } = attributes;

	const items = useSelect(
		( select ) => select( 'core/block-editor' ).getBlocks( clientId ),
		[ clientId ]
	);

	useEffect( () => {
		if ( items.length && activeTab >= items.length ) {
			setAttributes( { activeTab: items.length - 1 } );
		}
	}, [ items.length, activeTab, setAttributes ] );

	const blockProps = useBlockProps( {
		className: `gsb-tabs`,
		'data-style': style,
		'data-tabs-id': clientId,
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'gsb-tabs__panels' },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateInsertUpdatesSelection: false,
		}
	);

	const activePanelCss =
		`[data-tabs-id="${ clientId }"] > .gsb-tabs__panels > [data-block] { display: none; }` +
		`[data-tabs-id="${ clientId }"] > .gsb-tabs__panels > [data-block]:nth-child(${ activeTab + 1 }) { display: block; }`;

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
			<div { ...blockProps }>
				<style>{ activePanelCss }</style>
				<div className="gsb-tabs__nav" role="tablist">
					{ items.map( ( item, index ) => (
						<button
							key={ item.clientId }
							type="button"
							role="tab"
							className={
								'gsb-tabs__tab' +
								( index === activeTab ? ' is-active' : '' )
							}
							aria-selected={ index === activeTab }
							onClick={ () =>
								setAttributes( { activeTab: index } )
							}
						>
							{ item.attributes.label ||
								__( 'Tab', 'gamestuff-blocks' ) }
						</button>
					) ) }
				</div>
				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}
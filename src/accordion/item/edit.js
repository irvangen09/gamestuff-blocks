import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import {
	InnerBlocks,
	InspectorControls,
	RichText,
	useBlockProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';

import { PanelBody, SelectControl } from '@wordpress/components';

const HEADING_LEVELS = [
	{ label: 'H2', value: 'h2' },
	{ label: 'H3', value: 'h3' },
	{ label: 'H4', value: 'h4' },
	{ label: 'H5', value: 'h5' },
	{ label: 'H6', value: 'h6' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, headingLevel, triggerId, panelId } = attributes;

	// Detects an id inherited from another Accordion Item via
	// duplicate/copy-paste (Gutenberg clones attributes but assigns a
	// new clientId). Scoped to the whole post since a collision can
	// span two different Accordion blocks.
	const hasIdCollision = useSelect(
		( select ) => {
			if ( ! triggerId && ! panelId ) {
				return false;
			}

			const {
				getClientIdsWithDescendants,
				getBlockName,
				getBlockAttributes,
			} = select( blockEditorStore );

			return getClientIdsWithDescendants().some( ( otherId ) => {
				if ( otherId === clientId ) {
					return false;
				}

				if ( getBlockName( otherId ) !== 'gamestuff/accordion-item' ) {
					return false;
				}

				const otherAttributes = getBlockAttributes( otherId );

				return (
					( !! triggerId &&
						otherAttributes.triggerId === triggerId ) ||
					( !! panelId && otherAttributes.panelId === panelId )
				);
			} );
		},
		[ clientId, triggerId, panelId ]
	);

	// Bootstraps a persisted id on first create or id collision.
	// clientId is only a seed here — after save, ids are read back
	// from the stored markup (block.json source: "attribute").
	useEffect( () => {
		if ( ! triggerId || ! panelId || hasIdCollision ) {
			const seed = `${ clientId.slice( 0, 8 ) }-${ Math.random()
				.toString( 36 )
				.slice( 2, 6 ) }`;

			setAttributes( {
				triggerId: `gs-accordion-trigger-${ seed }`,
				panelId: `gs-accordion-panel-${ seed }`,
			} );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ hasIdCollision ] );

	const blockProps = useBlockProps( {
		className: 'gs-accordion-item',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Accordion Item', 'gamestuff-blocks' ) }>
					<SelectControl
						label={ __( 'Heading Level', 'gamestuff-blocks' ) }
						value={ headingLevel }
						options={ HEADING_LEVELS }
						onChange={ ( value ) =>
							setAttributes( {
								headingLevel: value,
							} )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="gs-accordion-item__header">
					<RichText
						tagName={ headingLevel }
						className="gs-accordion-item__title"
						value={ title }
						onChange={ ( value ) =>
							setAttributes( {
								title: value,
							} )
						}
						placeholder={ __(
							'Section title…',
							'gamestuff-blocks'
						) }
						allowedFormats={ [] }
					/>

					<button
						type="button"
						className="gs-accordion-item__toggle"
						tabIndex={ -1 }
						aria-hidden="true"
					>
						<span className="gs-accordion-item__chevron">▾</span>
					</button>
				</div>

				<div className="gs-accordion-item__content">
					<InnerBlocks templateLock={ false } />
				</div>
			</div>
		</>
	);
}
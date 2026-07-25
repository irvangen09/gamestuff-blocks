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

import { PanelBody, SelectControl, TextControl } from '@wordpress/components';

const HEADING_LEVELS = [
	{ label: 'H2', value: 'h2' },
	{ label: 'H3', value: 'h3' },
	{ label: 'H4', value: 'h4' },
	{ label: 'H5', value: 'h5' },
	{ label: 'H6', value: 'h6' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
	const { title, icon, iconColor, headingLevel, triggerId, panelId } =
		attributes;

	/**
	 * Detect a colliding id inherited from another Accordion Item in
	 * the same post. This happens when a block is duplicated or
	 * copy-pasted: Gutenberg clones attributes verbatim (including
	 * triggerId/panelId) but assigns a new clientId, so without this
	 * check the clone would keep the exact same ids as its source,
	 * producing duplicate `id` attributes on the rendered page.
	 *
	 * Scoped to the whole post, not just this item's siblings within
	 * one Accordion, because a collision can also happen across two
	 * different Accordion blocks on the same page (e.g. copy-pasting
	 * an Accordion Item from one Accordion into another).
	 */
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

	/**
	 * Bootstrap a stable, persisted id the first time this block is
	 * created (nothing saved yet to extract triggerId/panelId from),
	 * or regenerate it if a collision with a sibling was detected
	 * (duplicate/copy-paste case above).
	 *
	 * `clientId` is only used here as a convenient, already-unique
	 * seed for that generation — it is never referenced again after
	 * this. From the next save onward, triggerId and panelId are
	 * read back from the stored markup itself (see block.json
	 * `source: "attribute"`), so they stay identical every time the
	 * post is reopened, unlike clientId.
	 */
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

					<TextControl
						label={ __( 'Icon', 'gamestuff-blocks' ) }
						value={ icon }
						onChange={ ( value ) =>
							setAttributes( {
								icon: value,
							} )
						}
						placeholder="dashicons-media-document"
						help={ __(
							'Enter an icon class name, e.g. dashicons-instagram. You can also enter multiple classes at once (e.g. from Font Awesome) if your theme already loads that library.',
							'gamestuff-blocks'
						) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="gs-accordion-item__header">
					<span
						className={ `gs-accordion-item__icon dashicons ${ icon }` }
						style={ { color: iconColor } }
						aria-hidden="true"
					/>

					<RichText
						tagName={ headingLevel }
						className="gs-accordion-item__title"
						value={ title }
						onChange={ ( value ) =>
							setAttributes( {
								title: value,
							} )
						}
						placeholder={ __( 'Section title…', 'gamestuff-blocks' ) }
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

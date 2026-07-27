import { __ } from '@wordpress/i18n';
import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';

/**
 * Default content template when a new item is added.
 * Content isn't restricted with allowedBlocks so the editor is
 * free to use Paragraph, List, Link, etc. natively.
 */
const TEMPLATE = [ [ 'core/paragraph' ] ];

export default function Edit( { attributes, setAttributes } ) {
	const { title } = attributes;

	const blockProps = useBlockProps( {
		className: 'gs-timeline-item',
	} );

	return (
		<li { ...blockProps }>
			<span className="gs-timeline-item__node" aria-hidden="true" />
			<div className="gs-timeline-item__content">
				<RichText
					tagName="p"
					className="gs-timeline-item__title"
					placeholder={ __( 'Enter title…', 'gamestuff-blocks' ) }
					value={ title }
					onChange={ ( value ) => setAttributes( { title: value } ) }
					allowedFormats={ [
						'core/bold',
						'core/italic',
						'core/underline',
						'core/link',
						'core/code',
					] }
				/>
				<div className="gs-timeline-item__body">
					<InnerBlocks template={ TEMPLATE } templateLock={ false } />
				</div>
			</div>
		</li>
	);
}
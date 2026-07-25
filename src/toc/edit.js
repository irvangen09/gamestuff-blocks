/**
 * Editor view for GameStuff TOC — a static placeholder only, not a
 * live preview of the actual table of contents. This is a dynamic
 * block (see render.php); a real live preview would need
 * ServerSideRender, adding an extra request and complexity this block
 * doesn't need.
 */

import { __ } from '@wordpress/i18n';
import { useBlockProps, PlainText } from '@wordpress/block-editor';

export default function Edit( { attributes, setAttributes } ) {
	const { title } = attributes;

	const blockProps = useBlockProps( {
		className: 'gs-toc',
	} );

	return (
		<div { ...blockProps }>
			<div className="gs-toc__header">
				<span className="gs-toc__icon" aria-hidden="true">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
						<line x1="4" y1="6" x2="20" y2="6" />
						<line x1="4" y1="12" x2="20" y2="12" />
						<line x1="4" y1="18" x2="14" y2="18" />
					</svg>
				</span>
				<PlainText
					tagName="span"
					className="gs-toc__title"
					value={ title }
					onChange={ ( value ) => setAttributes( { title: value } ) }
					placeholder={ __( 'Daftar Isi', 'gamestuff-blocks' ) }
				/>
			</div>

			<p className="gs-toc__placeholder-note">
				{ __(
					'The table of contents is generated automatically from the article\u2019s headings when the page is viewed.',
					'gamestuff-blocks'
				) }
			</p>
		</div>
	);
}

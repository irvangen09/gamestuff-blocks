import { InnerBlocks, RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { characterName, headingLevel, portraitUrl, portraitAlt } =
		attributes;

	const blockProps = useBlockProps.save();

	const HeadingTag = headingLevel || 'h2';

	return (
		<div { ...blockProps }>
			<div className="gs-character">
				<div className="gs-character-card">
					<div className="gs-character-portrait-wrap">
						{ portraitUrl ? (
							<img
								src={ portraitUrl }
								alt={ portraitAlt }
								loading="lazy"
								className="gs-character-portrait"
							/>
						) : (
							<div
								className="gs-portrait-empty"
								aria-hidden="true"
							>
								<span className="dashicons dashicons-camera" />
							</div>
						) }
					</div>

					<div className="gs-character-panel">
						<div className="gs-character-summary">
							<div className="gs-summary-main">
								<RichText.Content
									tagName={ HeadingTag }
									className="gs-character-name"
									value={ characterName }
								/>
							</div>
						</div>

						<dl className="gs-character-rows">
							<InnerBlocks.Content />
						</dl>
					</div>
				</div>
			</div>
		</div>
	);
}

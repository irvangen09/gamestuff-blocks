import { RichText, useBlockProps } from '@wordpress/block-editor';

const ATTRIBUTES_V1 = {
	icon: { type: 'string', default: '' },
	label: { type: 'string', default: '' },
	value: { type: 'string', default: '' },
};

const SUPPORTS_V1 = {
	html: false,
	reusable: false,
};

function saveV1( { attributes } ) {
	const { icon, label, value } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'gs-info-list-row',
	} );

	return (
		<div { ...blockProps }>
			<div className="gs-info-list-row-label">
				{ icon && (
					<span
						className={ `dashicons ${ icon }` }
						aria-hidden="true"
					/>
				) }

				<RichText.Content
					tagName="span"
					className="gs-info-list-row-label-text"
					value={ label }
				/>
			</div>

			<RichText.Content
				tagName="span"
				className="gs-info-list-row-value"
				value={ value }
			/>
		</div>
	);
}

// Attributes are unchanged from the current schema — only the
// wrapper/value markup moved from div/span to dl/dt/dd — so no
// migrate() is needed.
const v1 = {
	attributes: ATTRIBUTES_V1,
	supports: SUPPORTS_V1,
	save: saveV1,
};

export default [ v1 ];
import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { icon, label, value } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'gs-row',
	} );

	return (
		<div { ...blockProps }>
			<dt className="gs-row-label">
				{ icon && (
					<span
						className={ `dashicons ${ icon }` }
						aria-hidden="true"
					/>
				) }

				<RichText.Content
					tagName="span"
					className="gs-row-label-text"
					value={ label }
				/>
			</dt>

			<dd className="gs-row-value gs-richtext">
				<RichText.Content value={ value } />
			</dd>
		</div>
	);
}

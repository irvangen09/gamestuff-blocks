import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { icon, label, value } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'gs-info-list-row',
	} );

	return (
		<dl { ...blockProps }>
			<dt className="gs-info-list-row-label">
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
			</dt>

			<RichText.Content
				tagName="dd"
				className="gs-info-list-row-value"
				value={ value }
			/>
		</dl>
	);
}

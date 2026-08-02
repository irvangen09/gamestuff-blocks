import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { icon, text } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'gs-info-list-requirement',
	} );

	return (
		<li { ...blockProps }>
			{ icon && (
				<span
					className={ `dashicons ${ icon }` }
					aria-hidden="true"
				/>
			) }

			<RichText.Content tagName="span" value={ text } />
		</li>
	);
}
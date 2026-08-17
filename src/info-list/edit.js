import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [
	'gamestuff/info-list-field',
	'gamestuff/info-list-requirements',
];

const TEMPLATE = [ [ 'gamestuff/info-list-field' ] ];

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'gs-info-list',
	} );

	return (
		<div { ...blockProps }>
			<InnerBlocks
				allowedBlocks={ ALLOWED_BLOCKS }
				template={ TEMPLATE }
				templateLock={ false }
			/>
		</div>
	);
}

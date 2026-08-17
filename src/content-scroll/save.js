import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { desktopColumns, gap, borderRadius, showImage, showTitle } =
		attributes;

	const wrapperClassName = [
		'gs-content-scroll',
		! showImage && 'gs-content-scroll--hide-image',
		! showTitle && 'gs-content-scroll--hide-title',
	]
		.filter( Boolean )
		.join( ' ' );

	const blockProps = useBlockProps.save( {
		className: wrapperClassName,
		style: {
			'--gs-cs-cols': desktopColumns,
			'--gs-cs-gap': `${ gap }px`,
			'--gs-cs-radius': `${ borderRadius }px`,
		},
	} );

	return (
		<div { ...blockProps }>
			{ /*
			 * Safari drops the implicit "list" accessibility role
			 * from a <ul> when list-style: none is applied. role="list"
			 * restores it explicitly (paired with role="listitem" on
			 * each child in content-scroll/item/save.js) so the
			 * collection of cards keeps proper list semantics for
			 * screen readers in every browser. ESLint's jsx-a11y
			 * considers this role redundant because it doesn't account
			 * for that Safari-specific behavior — this is intentional,
			 * not an oversight.
			 */ }
			{ /* eslint-disable-next-line jsx-a11y/no-redundant-roles */ }
			<ul className="gs-cs-track" role="list">
				<InnerBlocks.Content />
			</ul>
		</div>
	);
}

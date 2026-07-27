import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

import { TIMELINE_TYPES, DEFAULT_TIMELINE_TYPE } from './constants';

export default function Save( { attributes } ) {
	const { timelineType } = attributes;

	const TagName =
		TIMELINE_TYPES[ timelineType ]?.tag ||
		TIMELINE_TYPES[ DEFAULT_TIMELINE_TYPE ].tag;

	const blockProps = useBlockProps.save( {
		className: `gs-timeline gs-timeline--${ timelineType }`,
	} );

	return (
		<TagName { ...blockProps }>
			<InnerBlocks.Content />
		</TagName>
	);
}

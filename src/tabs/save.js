import { useInnerBlocksProps } from '@wordpress/block-editor';

/**
 * This is a dynamic block — render.php is what actually generates the
 * nav + panels markup shown to visitors (see PHP class TabsRenderer).
 *
 * save() still needs to output the serialized inner blocks, otherwise the
 * "tabs-item" children would never be stored in post_content at all. The
 * wrapper element below is only a carrier for that serialized content and
 * is never what gets displayed on the frontend.
 */
export default function save() {
	const innerBlocksProps = useInnerBlocksProps.save();

	return <div { ...innerBlocksProps } />;
}
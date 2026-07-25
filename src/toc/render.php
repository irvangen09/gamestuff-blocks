<?php
/**
 * Render template for the GameStuff TOC dynamic block. $attributes,
 * $content, and $block are supplied automatically by WordPress via
 * the "render" field in block.json.
 *
 * Heading scanning, tree building, and anchor injection live in
 * includes/Blocks/Toc/ (autoloaded classes), not here — this file
 * only assembles the wrapper markup around their output.
 *
 * @package GameStuff_Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use GameStuff\Blocks\Toc\HeadingCollector;

$post_id = get_the_ID();

if ( ! $post_id ) {
	return '';
}

$headings = HeadingCollector::get_headings( $post_id );

// Fail gracefully — no headings at all, don't render an empty,
// useless "Table of Contents" box.
if ( empty( $headings ) ) {
	return '';
}

$tree      = HeadingCollector::build_tree( $headings );
$list_html = HeadingCollector::render_tree( $tree );

$title = ! empty( $attributes['title'] ) ? $attributes['title'] : __( 'Daftar Isi', 'gamestuff-blocks' );

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'gs-toc' ) );
?>
<details <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput -- already escaped by get_block_wrapper_attributes(). ?>>
	<summary class="gs-toc__summary">
		<span class="gs-toc__icon" aria-hidden="true">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
				<line x1="4" y1="6" x2="20" y2="6"></line>
				<line x1="4" y1="12" x2="20" y2="12"></line>
				<line x1="4" y1="18" x2="14" y2="18"></line>
			</svg>
		</span>
		<span class="gs-toc__title"><?php echo esc_html( $title ); ?></span>
	</summary>
	<nav class="gs-toc__nav" aria-label="<?php echo esc_attr( $title ); ?>">
		<?php echo $list_html; // phpcs:ignore WordPress.Security.EscapeOutput -- already escaped per-element in HeadingCollector::render_tree(). ?>
	</nav>
</details>

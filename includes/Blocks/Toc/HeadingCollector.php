<?php
/**
 * TOC heading collector.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Blocks\Toc;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Scans a post's content for headings and turns them into the nested
 * list markup the TOC block renders.
 *
 * Rescans post_content itself (via parse_blocks()) rather than relying
 * on anything the frontend render pass has already done, so this can
 * run standalone from render.php regardless of render order. See
 * HeadingAnchorInjector for the separate job of writing matching `id`
 * attributes onto the real headings in the article body.
 *
 * @since 1.0.0
 */
final class HeadingCollector {

	/**
	 * Static-only class — not meant to be instantiated.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {}

	/**
	 * Get every heading in a post, each with a unique anchor already
	 * assigned.
	 *
	 * @since 1.0.0
	 *
	 * @param int $post_id Post to scan.
	 * @return array<int, array{level:int, text:string, anchor:string}>
	 */
	public static function get_headings( int $post_id ): array {

		/*
		 * 'raw' context is deliberate here, not the 'display' default.
		 * This content is about to be re-parsed with parse_blocks(),
		 * which expects the exact markup as stored in the database —
		 * including the `<!-- wp:heading -->` comment delimiters.
		 * The default 'display' context runs the value through the
		 * `post_content` filter (wptexturize, wpautop, and similar),
		 * which is meant for content about to be shown to a visitor,
		 * not content about to be parsed back into blocks.
		 */
		$post_content = get_post_field( 'post_content', $post_id, 'raw' );

		if ( ! is_string( $post_content ) || '' === $post_content ) {
			return array();
		}

		$blocks = parse_blocks( $post_content );
		$raw    = array();

		self::collect( $blocks, $raw );

		if ( empty( $raw ) ) {
			return array();
		}

		// Used-slugs pool for this scan only — created fresh on every
		// call rather than kept as static state, since one full
		// rescan of the document is all a single TOC render needs.
		$used_slugs = array();

		foreach ( $raw as &$heading ) {
			$manual_anchor = $heading['manual_anchor'] ?? '';

			$heading['anchor'] = ( '' !== $manual_anchor )
				? AnchorSlugger::use_manual( $manual_anchor, $used_slugs )
				: AnchorSlugger::generate( $heading['text'], $used_slugs );

			unset( $heading['manual_anchor'] );
		}
		unset( $heading );

		return $raw;
	}

	/**
	 * Recursively scan a parse_blocks() result for heading sources.
	 *
	 * Recognizes two sources of headings:
	 * - Regular "core/heading" blocks, anywhere in the tree (including
	 *   nested inside Accordion/Content Scroll/Timeline).
	 * - "gamestuff/accordion-item" titles — not a separate Heading
	 *   block, but an attribute of the block itself, rendered as a
	 *   heading tag via its `headingLevel` attribute.
	 *
	 * Character Infobox is deliberately NOT a heading source: the
	 * character name there isn't part of the article's reading flow,
	 * and its fields are rich-text attributes rather than InnerBlocks,
	 * so it could never contain a nested "core/heading" or
	 * "accordion-item" anyway.
	 *
	 * "gamestuff/accordion-item" may not exist as a registered block
	 * yet depending on which blocks have been built so far — that's
	 * fine, this only matches a block name string already present in
	 * parsed content and has no dependency on the block being active.
	 *
	 * @since 1.0.0
	 *
	 * @param array $blocks  Block array (from parse_blocks() or innerBlocks).
	 * @param array $results Collected by reference, not by return value.
	 */
	private static function collect( array $blocks, array &$results ): void {

		foreach ( $blocks as $block ) {
			$block_name = $block['blockName'] ?? '';

			if ( 'core/heading' === $block_name ) {
				$text = trim( wp_strip_all_tags( $block['innerHTML'] ?? '' ) );

				if ( '' !== $text ) {
					$results[] = array(
						'level'         => (int) ( $block['attrs']['level'] ?? 2 ),
						'text'          => $text,
						'manual_anchor' => $block['attrs']['anchor'] ?? '',
					);
				}
			} elseif ( 'gamestuff/accordion-item' === $block_name ) {
				$heading_level = $block['attrs']['headingLevel'] ?? 'h2';
				$text          = self::extract_accordion_title( $block['innerHTML'] ?? '' );

				if ( '' !== $text ) {
					$results[] = array(
						'level' => (int) substr( $heading_level, 1 ),
						'text'  => $text,
					);
				}
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				self::collect( $block['innerBlocks'], $results );
			}
		}
	}

	/**
	 * Extract an Accordion Item's title text from its innerHTML.
	 *
	 * Can't use $block['attrs']['title'] — that attribute is sourced
	 * from HTML (RichText), which parse_blocks() doesn't extract on
	 * the PHP side. The title renders inside
	 * `<span class="gs-accordion-item__title">`, not directly on the
	 * heading tag itself, matching the
	 * `.gs-accordion-item__heading > button > span.gs-accordion-item__title`
	 * markup the Accordion Item block saves.
	 *
	 * Shared with HeadingAnchorInjector, which needs the same
	 * extraction against already-rendered markup rather than parsed
	 * block data.
	 *
	 * @since 1.0.0
	 *
	 * @param string $html Accordion Item block's innerHTML (or rendered markup).
	 * @return string
	 */
	public static function extract_accordion_title( string $html ): string {

		if ( preg_match( '/<span[^>]*class="[^"]*gs-accordion-item__title[^"]*"[^>]*>(.*?)<\/span>/s', $html, $matches ) ) {
			return trim( wp_strip_all_tags( $matches[1] ) );
		}

		return '';
	}

	/**
	 * Turn a flat heading list into a nested tree by level — an H3
	 * automatically becomes a child of the preceding H2, and so on.
	 *
	 * @since 1.0.0
	 *
	 * @param array $headings Result of get_headings().
	 * @return array Tree structure: each node has 'text', 'anchor', 'children'.
	 */
	public static function build_tree( array $headings ): array {

		$root = array();

		// Sentinel level 0 at the bottom of the stack — lower than any
		// real heading (minimum H2), so the "pop while shallower"
		// logic below works uniformly with no special case for the
		// first item.
		$stack   = array();
		$stack[] = array(
			'level'    => 0,
			'children' => &$root,
		);

		foreach ( $headings as $heading ) {
			while ( count( $stack ) > 1 && $stack[ count( $stack ) - 1 ]['level'] >= $heading['level'] ) {
				array_pop( $stack );
			}

			$top_index = count( $stack ) - 1;

			$stack[ $top_index ]['children'][] = array(
				'text'     => $heading['text'],
				'anchor'   => $heading['anchor'],
				'children' => array(),
			);

			$new_index = count( $stack[ $top_index ]['children'] ) - 1;

			$stack[] = array(
				'level'    => $heading['level'],
				'children' => &$stack[ $top_index ]['children'][ $new_index ]['children'],
			);
		}

		return $root;
	}

	/**
	 * Render a heading tree as nested <ul><li> markup.
	 *
	 * @since 1.0.0
	 *
	 * @param array $nodes Tree structure from build_tree().
	 * @return string
	 */
	public static function render_tree( array $nodes ): string {

		if ( empty( $nodes ) ) {
			return '';
		}

		$html = '<ul class="gs-toc__list">';

		foreach ( $nodes as $node ) {
			$html .= '<li class="gs-toc__item">';
			$html .= '<a href="#' . esc_attr( $node['anchor'] ) . '">' . esc_html( $node['text'] ) . '</a>';
			$html .= self::render_tree( $node['children'] );
			$html .= '</li>';
		}

		$html .= '</ul>';

		return $html;
	}
}
<?php
/**
 * TOC heading anchor injector.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Blocks\Toc;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Writes an `id` attribute onto the real headings in an article's
 * body, so the links HeadingCollector builds actually have somewhere
 * to jump to.
 *
 * Runs unconditionally on the front end, independent of whether a TOC
 * block is even present on the page — headings should get stable
 * anchors regardless, e.g. for direct linking. Uses its own
 * used-slugs pool (reset once per `the_content` call, see
 * boot()), separate from HeadingCollector's — the two never share a
 * reference, but process headings in the same document order with
 * the same slug algorithm (AnchorSlugger), so the anchors they
 * produce always agree.
 */
final class HeadingAnchorInjector {

	/**
	 * Static-only class — not meant to be instantiated.
	 */
	private function __construct() {}

	/**
	 * Register the injector's hooks.
	 *
	 * Called from Plugin::register_services() unconditionally (not
	 * gated behind is_admin() or a block-presence check), since
	 * `the_content` and the `render_block_*` hooks it relies on only
	 * ever fire on the front end anyway.
	 *
	 *
	 * @return void
	 */
	public static function boot(): void {

		/*
		 * Priority 8 — before do_blocks() (priority 9) starts
		 * rendering blocks, so the slug tracker is always clean at
		 * the start of each the_content call (e.g. multiple posts on
		 * one archive page).
		 */
		add_filter( 'the_content', array( self::class, 'reset_used_slugs' ), 8 );

		add_filter( 'render_block_core/heading', array( self::class, 'inject_heading_anchor' ), 10, 2 );
		add_filter( 'render_block_gamestuff/accordion-item', array( self::class, 'inject_accordion_item_anchor' ), 10, 2 );
	}

	/**
	 * Reset the used-slugs pool. Content is returned unchanged — this
	 * only rides along on the `the_content` filter for its side
	 * effect.
	 *
	 *
	 * @param string $content Content, passed through unmodified.
	 * @return string
	 */
	public static function reset_used_slugs( string $content ): string {

		$used_slugs = &self::used_slugs();
		$used_slugs = array();

		return $content;
	}

	/**
	 * Inject an `id` into rendered `<h2>`-`<h6>` markup from
	 * core/heading, only when it doesn't already have one (e.g. from
	 * a manually-set HTML Anchor, which WordPress core already
	 * renders itself).
	 *
	 *
	 * @param string $block_content Rendered heading markup.
	 * @param array  $block         Block data (attrs, etc).
	 * @return string
	 */
	public static function inject_heading_anchor( string $block_content, array $block ): string {

		if ( '' === trim( $block_content ) ) {
			return $block_content;
		}

		$used_slugs    = &self::used_slugs();
		$manual_anchor = $block['attrs']['anchor'] ?? '';

		if ( '' !== $manual_anchor ) {
			// Already has an id from a manual HTML Anchor (core
			// already rendered it) — just register it so no other
			// heading reuses it, no injection needed.
			AnchorSlugger::use_manual( $manual_anchor, $used_slugs );
			return $block_content;
		}

		if ( false !== strpos( $block_content, ' id=' ) ) {
			// Defensive: an id from some other source we didn't anticipate.
			return $block_content;
		}

		$text = trim( wp_strip_all_tags( $block_content ) );

		if ( '' === $text ) {
			return $block_content;
		}

		$anchor = AnchorSlugger::generate( $text, $used_slugs );

		return (string) preg_replace(
			'/<h([1-6])\b/',
			'<h$1 id="' . esc_attr( $anchor ) . '"',
			$block_content,
			1
		);
	}

	/**
	 * Inject an `id` into a rendered Accordion Item title, the same
	 * way — this time onto its wrapping heading tag
	 * (`.gs-accordion-item__heading`), not the title span inside it,
	 * so the id lands on the actual semantic heading element.
	 *
	 *
	 * @param string $block_content Rendered Accordion Item markup.
	 * @param array  $block         Block data (attrs, etc).
	 * @return string
	 */
	public static function inject_accordion_item_anchor( string $block_content, array $block ): string {

		$used_slugs = &self::used_slugs();

		// Can't use $block['attrs']['title'] — sourced from HTML
		// (RichText), not available through render_block_* filters.
		// Extract directly from the already-rendered markup instead.
		$text = HeadingCollector::extract_accordion_title( $block_content );

		if ( '' === $text ) {
			return $block_content;
		}

		$anchor = AnchorSlugger::generate( $text, $used_slugs );

		// Target the heading tag carrying the
		// "gs-accordion-item__heading" class specifically, not just
		// the first heading tag found, in case the Accordion Item's
		// InnerBlocks content contains a heading of its own.
		return (string) preg_replace(
			'/(<h[1-6][^>]*class="[^"]*gs-accordion-item__heading[^"]*"[^>]*)(>)/',
			'$1 id="' . esc_attr( $anchor ) . '"$2',
			$block_content,
			1
		);
	}

	/**
	 * Access point for the injector's own used-slugs pool, held for
	 * the duration of one page render and reset per the_content call
	 * (see reset_used_slugs()).
	 *
	 * Returned by reference, mirroring the pattern
	 * SettingsRegistry uses a private static property for — a plain
	 * static local variable serves the same purpose here without
	 * introducing per-instance state to a static-only class.
	 *
	 *
	 * @return string[] Reference to the used-slugs pool.
	 */
	private static function &used_slugs(): array {

		static $used_slugs = array();

		return $used_slugs;
	}
}

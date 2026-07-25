<?php
/**
 * TOC anchor slug generator.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Blocks\Toc;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Generates unique anchor slugs from heading text, and reconciles
 * manually-set anchors (e.g. the core Heading block's "HTML Anchor"
 * field) against the same pool of used slugs.
 *
 * Used independently by two different callers — HeadingCollector
 * (building the TOC list itself) and HeadingAnchorInjector (writing
 * matching `id` attributes onto the real headings in the article body)
 * — each with its own `$used_slugs` list, passed by reference rather
 * than held here as state. Both callers process headings in the same
 * document order using this exact same algorithm, so the anchors they
 * independently produce always agree without the two ever needing to
 * share a reference to one another.
 *
 * @since 1.0.0
 */
final class AnchorSlugger {

	/**
	 * Static-only class — not meant to be instantiated.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {}

	/**
	 * Register a manually-set anchor (e.g. a Heading block's HTML
	 * Anchor field) against the used-slugs pool, so later
	 * auto-generated anchors don't collide with it.
	 *
	 * @since 1.0.0
	 *
	 * @param string   $anchor     Manually-set anchor, as authored.
	 * @param string[] $used_slugs Slugs already used, by reference.
	 * @return string Final anchor: the sanitized manual anchor as-is,
	 *                unless it collides with something already used,
	 *                in which case a unique derivative is generated.
	 */
	public static function use_manual( string $anchor, array &$used_slugs ): string {

		$anchor = sanitize_title( $anchor );

		if ( '' === $anchor ) {
			return self::generate( '', $used_slugs );
		}

		if ( ! in_array( $anchor, $used_slugs, true ) ) {
			$used_slugs[] = $anchor;
			return $anchor;
		}

		return self::generate( $anchor, $used_slugs );
	}

	/**
	 * Generate a unique slug from heading text.
	 *
	 * @since 1.0.0
	 *
	 * @param string   $text       Heading text (may contain HTML; stripped).
	 * @param string[] $used_slugs Slugs already used, by reference.
	 * @return string Unique slug, ready for use as an id/#fragment.
	 */
	public static function generate( string $text, array &$used_slugs ): string {

		$base = sanitize_title( wp_strip_all_tags( $text ) );

		if ( '' === $base ) {
			$base = 'section';
		}

		$slug   = $base;
		$suffix = 2;

		while ( in_array( $slug, $used_slugs, true ) ) {
			$slug = $base . '-' . $suffix;
			++$suffix;
		}

		$used_slugs[] = $slug;

		return $slug;
	}
}

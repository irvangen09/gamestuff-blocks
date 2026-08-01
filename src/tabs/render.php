<?php
/**
 * Server-side rendering for the Tabs block.
 *
 * Variables available: $attributes, $content, $block (WP_Block instance).
 *
 * @package GameStuff
 */

use GameStuff\Blocks\Tabs\TabsRenderer;

echo TabsRenderer::render( $attributes, $block ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside TabsRenderer.
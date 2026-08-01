<?php
/**
 * Global settings registry.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Foundation for plugin-wide settings (e.g. Primary Color) that apply
 * across multiple blocks, instead of being fixed per-block in code.
 *
 * This class only provides registration, storage, and value
 * resolution — no admin UI (see SettingsPage) and no CSS output (see
 * SettingsCss) live here, so each concern can change independently.
 *
 * All saved values live in a single WordPress option rather than one
 * option per setting, which keeps this to one autoloaded row in the
 * options table no matter how many settings get registered later.
 *
 * @since 1.0.0
 */
final class SettingsRegistry {

	/**
	 * Option name used to store every setting's saved value together,
	 * as a single associative array ( setting id => value ).
	 *
	 * @since 1.0.0
	 */
	private const OPTION = 'gamestuff_blocks_settings';

	/**
	 * Registered settings, keyed by id.
	 *
	 * @since 1.0.0
	 * @var array<string, array<string, mixed>>
	 */
	private static array $registry = array();

	/**
	 * Static-only class — not meant to be instantiated.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {}

	/**
	 * Register the plugin's built-in settings.
	 *
	 * Called once from Plugin::register_services(), before the
	 * settings page or blocks are registered, so every setting a
	 * block might rely on already exists by the time it's needed.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function boot(): void {

		self::register(
			'primary_color',
			array(
				'label'       => __( 'Primary Color', 'gamestuff-blocks' ),
				'type'        => 'color',
				/*
				 * Confirmed against the old plugin (v1.7.0), not a
				 * placeholder: this matches $gs-brand-accent in its
				 * src/shared/_tokens.scss, the one accent color
				 * already used consistently in production across
				 * Character Infobox, Timeline, and TOC.
				 */
				'default'     => '#fe6f22',
				'targets'     => array(
					array(
						'selector' => '.gs-toc',
						'property' => '--gs-accent',
					),
					array(
						'selector' => '.gs-timeline',
						'property' => '--gs-timeline-accent',
					),
					array(
						'selector' => '.gs-character',
						'property' => '--gs-accent',
					),
					array(
						'selector' => '.gs-info-list',
						'property' => '--gs-accent',
					),
					array(
						'selector' => '.gsb-tabs',
						'property' => '--gs-accent',
					),
				),
				'group'       => 'appearance',
				'description' => __( 'Accent color used across every GameStuff block.', 'gamestuff-blocks' ),
			)
		);

		self::register(
			'color_scheme',
			array(
				'label'       => __( 'Color Scheme', 'gamestuff-blocks' ),
				'type'        => 'select',
				/*
				 * "Auto" adds no override — every block's CSS already
				 * adapts via currentColor/color-mix(). "Light"/"Dark"
				 * force one fixed look regardless of the theme.
				 */
				'default'     => 'auto',
				'options'     => array(
					'auto'  => __( 'Auto (recommended — follows the theme automatically)', 'gamestuff-blocks' ),
					'light' => __( 'Light (always use light colors)', 'gamestuff-blocks' ),
					'dark'  => __( 'Dark (always use dark colors)', 'gamestuff-blocks' ),
				),
				'targets'     => array(),
				'group'       => 'appearance',
				'description' => __( 'How every GameStuff block adapts to dark mode.', 'gamestuff-blocks' ),
			)
		);
	}

	/**
	 * Register a global setting.
	 *
	 * Registering a setting here does not by itself display it
	 * anywhere or output any CSS — SettingsPage and SettingsCss read
	 * this registry to do that.
	 *
	 * @since 1.0.0
	 *
	 * @param string               $id   Unique setting id, e.g. 'primary_color'.
	 * @param array<string, mixed> $args {
	 *     Setting configuration.
	 *
	 *     @type string $label        Human-readable label for the admin page.
	 *     @type string $type         Field type interpreted by SettingsPage's
	 *                                field renderer: 'color', 'select',
	 *                                or 'text' (default).
	 *     @type string $default      Value used whenever nothing has been
	 *                                saved yet, or the saved value is empty.
	 *     @type array  $options      For type 'select' only: allowed values
	 *                                as { value => label } pairs, e.g.
	 *                                [ 'auto' => 'Auto', 'light' => 'Light' ].
	 *                                Both the admin page's <select> and the
	 *                                sanitizer read this — a submitted value
	 *                                not present here is rejected.
	 *     @type array  $targets      List of { selector, property } pairs
	 *                                where this setting's value should be
	 *                                written as a CSS custom property
	 *                                override, e.g.:
	 *                                [ [ 'selector' => '.gs-character',
	 *                                    'property' => '--gs-accent' ] ]
	 *                                All declared centrally here in
	 *                                boot() rather than per-block, since
	 *                                there are only a handful total.
	 *                                Re-evaluated when Info List (the
	 *                                first new block since this trigger
	 *                                was documented) needed a target —
	 *                                affirmed to stay centralized here,
	 *                                since the list is still small and
	 *                                every entry is static. Revisit again
	 *                                if this array starts feeling
	 *                                unmanageable, or a block needs
	 *                                conditional/dynamic registration
	 *                                (not just another static entry).
	 *     @type string $group        Section grouping on the admin page,
	 *                                e.g. 'appearance'.
	 *     @type string $description  Short help text shown under the field
	 *                                on the admin page.
	 * }
	 * @return void
	 */
	public static function register( string $id, array $args ): void {

		self::$registry[ $id ] = wp_parse_args(
			$args,
			array(
				'label'       => '',
				'type'        => 'text',
				'default'     => '',
				'options'     => array(),
				'targets'     => array(),
				'group'       => 'general',
				'description' => '',
			)
		);
	}

	/**
	 * Get every registered setting.
	 *
	 * @since 1.0.0
	 *
	 * @return array<string, array<string, mixed>> Registered settings, keyed by id.
	 */
	public static function all(): array {

		return self::$registry;
	}

	/**
	 * Get the option name every setting's value is stored under.
	 *
	 * @since 1.0.0
	 *
	 * @return string
	 */
	public static function option_name(): string {

		return self::OPTION;
	}

	/**
	 * Get every saved setting value, as currently stored in the
	 * database.
	 *
	 * Returns only what has actually been saved — does not fill in
	 * defaults for settings that were registered but never saved. Use
	 * get_value() instead for the effective value.
	 *
	 * @since 1.0.0
	 *
	 * @return array<string, string> Saved values, keyed by setting id.
	 */
	public static function get_saved_values(): array {

		return get_option( self::OPTION, array() );
	}

	/**
	 * Get the effective value of one setting: the saved value if
	 * present and non-empty, otherwise the registered default.
	 *
	 * @since 1.0.0
	 *
	 * @param string $id Setting id, as passed to register().
	 * @return string Effective value. Empty string if the setting was
	 *                never registered at all.
	 */
	public static function get_value( string $id ): string {

		if ( ! isset( self::$registry[ $id ] ) ) {
			return '';
		}

		$saved = self::get_saved_values();

		if ( isset( $saved[ $id ] ) && '' !== $saved[ $id ] ) {
			return $saved[ $id ];
		}

		return self::$registry[ $id ]['default'];
	}
}
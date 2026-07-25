<?php
/**
 * Global settings admin page.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the "Settings > GameStuff Blocks" admin page and handles
 * saving the values entered there.
 *
 * Renders a single settings form built directly from whatever is
 * registered in SettingsRegistry, so adding a new setting later only
 * requires a SettingsRegistry::register() call — this file does not
 * need to change. The tabbed layout (Dashboard / Blocks / Appearance /
 * Performance / Tools / About) described in the product concept is
 * intentionally not built yet: with only one setting registered so
 * far, a single form section is simpler and equally functional; the
 * tab structure belongs to a later stage once there's more than one
 * group of content to separate (e.g. once block enable/disable
 * toggles exist).
 *
 * @since 1.0.0
 */
final class SettingsPage {

	/**
	 * Slug used for both the admin page and the settings group passed
	 * to register_setting() / settings_fields().
	 *
	 * @since 1.0.0
	 */
	private const PAGE_SLUG = 'gamestuff-blocks';

	/**
	 * Static-only class — not meant to be instantiated.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {}

	/**
	 * Register the admin menu entry and the setting itself.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function boot(): void {

		add_action( 'admin_menu', array( self::class, 'register_menu' ) );
		add_action( 'admin_init', array( self::class, 'register_setting' ) );
	}

	/**
	 * Add the settings page under Settings > GameStuff Blocks.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function register_menu(): void {

		add_options_page(
			__( 'GameStuff Blocks', 'gamestuff-blocks' ),
			__( 'GameStuff Blocks', 'gamestuff-blocks' ),
			'manage_options',
			self::PAGE_SLUG,
			array( self::class, 'render_page' )
		);
	}

	/**
	 * Register the single option every setting value is stored in,
	 * with the WordPress Settings API.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function register_setting(): void {

		register_setting(
			self::PAGE_SLUG,
			SettingsRegistry::option_name(),
			array(
				'type'              => 'array',
				'sanitize_callback' => array( self::class, 'sanitize' ),
				'default'           => array(),
			)
		);
	}

	/**
	 * Sanitize submitted values before they're saved, one field at a
	 * time according to each setting's registered type.
	 *
	 * Only known, registered setting ids are kept — anything else in
	 * the submitted array (which shouldn't happen from this page's
	 * own form, but could from a crafted request) is silently
	 * dropped rather than saved as-is.
	 *
	 * @since 1.0.0
	 *
	 * @param mixed $input Raw submitted value for the settings option.
	 * @return array<string, string> Sanitized values, keyed by setting id.
	 */
	public static function sanitize( $input ): array {

		$input     = is_array( $input ) ? $input : array();
		$sanitized = array();

		foreach ( SettingsRegistry::all() as $id => $setting ) {

			if ( ! isset( $input[ $id ] ) ) {
				continue;
			}

			$sanitized[ $id ] = self::sanitize_value( $input[ $id ], $setting['type'] );
		}

		return $sanitized;
	}

	/**
	 * Sanitize a single value according to its setting type.
	 *
	 * @since 1.0.0
	 *
	 * @param mixed  $value Raw value for this one field.
	 * @param string $type  Setting type, e.g. 'color', 'text'.
	 * @return string Sanitized value.
	 */
	private static function sanitize_value( $value, string $type ): string {

		$value = (string) $value;

		if ( 'color' === $type ) {
			$color = sanitize_hex_color( $value );
			return null === $color ? '' : $color;
		}

		return sanitize_text_field( $value );
	}

	/**
	 * Render the settings page.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function render_page(): void {

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'GameStuff Blocks', 'gamestuff-blocks' ); ?></h1>
			<form action="options.php" method="post">
				<?php
				settings_fields( self::PAGE_SLUG );
				self::render_fields();
				submit_button();
				?>
			</form>
		</div>
		<?php
	}

	/**
	 * Render one form field per registered setting.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	private static function render_fields(): void {

		$option_name = SettingsRegistry::option_name();
		?>
		<table class="form-table" role="presentation">
			<tbody>
				<?php foreach ( SettingsRegistry::all() as $id => $setting ) : ?>
					<tr>
						<th scope="row">
							<label for="<?php echo esc_attr( $id ); ?>">
								<?php echo esc_html( $setting['label'] ); ?>
							</label>
						</th>
						<td>
							<?php self::render_field( $id, $setting, $option_name ); ?>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
		<?php
	}

	/**
	 * Render a single field, using the field type to pick the right
	 * input control.
	 *
	 * The 'color' type uses a native `<input type="color">` rather
	 * than a JavaScript-driven color picker, so this page has no
	 * script dependency at all — the browser provides the picker UI
	 * itself.
	 *
	 * @since 1.0.0
	 *
	 * @param string               $id          Setting id.
	 * @param array<string, mixed> $setting     Setting configuration, as registered.
	 * @param string               $option_name Option name the value should submit under.
	 * @return void
	 */
	private static function render_field( string $id, array $setting, string $option_name ): void {

		$value = SettingsRegistry::get_value( $id );
		$name  = sprintf( '%s[%s]', $option_name, $id );

		if ( 'color' === $setting['type'] ) {
			printf(
				'<input type="color" id="%1$s" name="%2$s" value="%3$s" />',
				esc_attr( $id ),
				esc_attr( $name ),
				esc_attr( $value )
			);
			return;
		}

		printf(
			'<input type="text" id="%1$s" name="%2$s" value="%3$s" class="regular-text" />',
			esc_attr( $id ),
			esc_attr( $name ),
			esc_attr( $value )
		);
	}
}
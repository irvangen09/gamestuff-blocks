<?php
/**
 * Global settings admin page.
 *
 * @package GameStuff_Blocks
 */

namespace GameStuff\Settings;

use GameStuff\Blocks\BlockRegistry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the "Settings > GameStuff Blocks" admin page and handles
 * saving the values entered there.
 *
 * Two tabs are rendered: "Appearance" (every setting registered in
 * SettingsRegistry, filtered by its 'group') and "Blocks" (per-block
 * enable/disable toggles, reading/writing BlockRegistry's own
 * option). These are two independent WordPress options, each
 * registered under the same settings group (PAGE_SLUG) so a single
 * settings_fields() call covers both — but each tab's <form> only
 * includes fields for the option that tab edits, so submitting one
 * tab never touches the other's saved value (see options.php: an
 * option is only processed when its key is present in $_POST).
 *
 * The tabbed layout replaces the single-section form this page used
 * to render before block enable/disable toggles existed — see the
 * previous docblock note here, which named this exact trigger.
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
	 * Valid tab slugs, in the order they're rendered, mapped to their
	 * label. The first is the default when no ?tab= is present or an
	 * unrecognized one is passed.
	 *
	 * @since 1.6.0
	 * @var array<string, string>
	 */
	private const TABS = array(
		'appearance' => 'Appearance',
		'blocks'     => 'Blocks',
	);

	/**
	 * Static-only class — not meant to be instantiated.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {}

	/**
	 * Register the admin menu entry and both settings.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function boot(): void {

		add_action( 'admin_menu', array( self::class, 'register_menu' ) );
		add_action( 'admin_init', array( self::class, 'register_settings' ) );
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
	 * Register both options this page saves — SettingsRegistry's
	 * (Appearance tab) and BlockRegistry's (Blocks tab) — under the
	 * same settings group, with the WordPress Settings API.
	 *
	 * @since 1.6.0 Renamed from register_setting() (singular) and
	 *              extended to also register BlockRegistry's option,
	 *              now that this page has more than one to save.
	 *
	 * @return void
	 */
	public static function register_settings(): void {

		register_setting(
			self::PAGE_SLUG,
			SettingsRegistry::option_name(),
			array(
				'type'              => 'array',
				'sanitize_callback' => array( self::class, 'sanitize' ),
				'default'           => array(),
			)
		);

		register_setting(
			self::PAGE_SLUG,
			BlockRegistry::option_name(),
			array(
				'type'              => 'array',
				'sanitize_callback' => array( self::class, 'sanitize_active_blocks' ),
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

			$sanitized[ $id ] = self::sanitize_value( $input[ $id ], $setting );
		}

		return $sanitized;
	}

	/**
	 * Sanitize a single value according to its setting type.
	 *
	 * @since 1.0.0
	 * @since 1.7.0 Now takes the full setting config instead of just
	 *              its type, so the 'select' type can validate the
	 *              submitted value against its own registered
	 *              'options' rather than accepting any string.
	 *
	 * @param mixed                $value   Raw value for this one field.
	 * @param array<string, mixed> $setting Setting configuration, as registered.
	 * @return string Sanitized value.
	 */
	private static function sanitize_value( $value, array $setting ): string {

		$value = (string) $value;
		$type  = $setting['type'];

		if ( 'color' === $type ) {
			$color = sanitize_hex_color( $value );
			return null === $color ? '' : $color;
		}

		if ( 'select' === $type ) {
			// Anything other than one of the registered option
			// values is rejected outright (falls back to the
			// setting's default via get_value()) rather than saved
			// as-is — this field's own <select> never submits
			// anything else, so a value that doesn't match can only
			// come from a crafted request.
			$value = sanitize_key( $value );
			return array_key_exists( $value, $setting['options'] ) ? $value : '';
		}

		return sanitize_text_field( $value );
	}

	/**
	 * Sanitize the submitted Blocks tab values and turn them into the
	 * disabled-slug list BlockRegistry actually stores.
	 *
	 * The form's checkboxes are named so a checked box means "this
	 * block is active" — the intuitive direction for this UI — but
	 * BlockRegistry's option has stored the inverse (a deny-list of
	 * disabled slugs) since it was first introduced, and changing
	 * that storage format now would be a breaking change for no
	 * reason a site owner would ever see. So the conversion happens
	 * once, here: every known block slug that was NOT submitted as
	 * checked is considered disabled.
	 *
	 * A hidden `_submitted` field (see render_blocks_fields()) keeps
	 * this option's key present in $_POST even when every checkbox is
	 * unchecked — without it, submitting a form with nothing checked
	 * would look identical to not submitting this option at all, and
	 * options.php would silently leave the previous value in place
	 * instead of saving "everything disabled".
	 *
	 * @since 1.6.0
	 *
	 * @param mixed $input Raw submitted value for BlockRegistry's option.
	 * @return string[] Disabled block slugs.
	 */
	public static function sanitize_active_blocks( $input ): array {

		$input = is_array( $input ) ? $input : array();

		$checked = isset( $input['active'] ) ? (array) $input['active'] : array();
		$checked = array_map( 'sanitize_key', $checked );

		// Only top-level blocks are ever checkboxes in the form (see
		// render_blocks_fields()), so only those need to be considered
		// here. Child blocks (accordion-item and similar) never get
		// their own entry in the saved disabled-list at all — their
		// state always cascades from their parent's, resolved in
		// BlockRegistry::is_active().
		$toggleable_slugs = BlockRegistry::toggleable_slugs();

		return array_values( array_diff( $toggleable_slugs, $checked ) );
	}

	/**
	 * Render the settings page: tab navigation, then the current
	 * tab's form.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function render_page(): void {

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$current_tab = self::current_tab();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'GameStuff Blocks', 'gamestuff-blocks' ); ?></h1>
			<?php self::render_tab_nav( $current_tab ); ?>
			<form action="options.php" method="post">
				<?php
				settings_fields( self::PAGE_SLUG );

				if ( 'blocks' === $current_tab ) {
					self::render_blocks_fields();
				} else {
					self::render_fields( $current_tab );
				}

				submit_button();
				?>
			</form>
		</div>
		<?php
	}

	/**
	 * Resolve the currently requested tab from `?tab=`, falling back
	 * to the first entry in TABS for anything missing or unrecognized.
	 *
	 * @since 1.6.0
	 *
	 * @return string
	 */
	private static function current_tab(): string {

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only tab selection, not a state change.
		$requested = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : '';

		if ( isset( self::TABS[ $requested ] ) ) {
			return $requested;
		}

		return array_key_first( self::TABS );
	}

	/**
	 * Render the tab navigation.
	 *
	 * @since 1.6.0
	 *
	 * @param string $current_tab Currently active tab slug.
	 * @return void
	 */
	private static function render_tab_nav( string $current_tab ): void {

		$base_url = menu_page_url( self::PAGE_SLUG, false );
		?>
		<nav class="nav-tab-wrapper" aria-label="<?php esc_attr_e( 'Secondary menu', 'gamestuff-blocks' ); ?>">
			<?php foreach ( self::TABS as $slug => $label ) : ?>
				<a
					href="<?php echo esc_url( add_query_arg( 'tab', $slug, $base_url ) ); ?>"
					class="nav-tab <?php echo $slug === $current_tab ? 'nav-tab-active' : ''; ?>"
				>
					<?php echo esc_html( self::tab_label( $slug, $label ) ); ?>
				</a>
			<?php endforeach; ?>
		</nav>
		<br />
		<?php
	}

	/**
	 * Translate a tab's label.
	 *
	 * Kept as a small lookup rather than inlining __() calls directly
	 * in the TABS constant, since constant expressions can't call
	 * functions.
	 *
	 * @since 1.6.0
	 *
	 * @param string $slug          Tab slug.
	 * @param string $fallback_label Untranslated fallback label.
	 * @return string
	 */
	private static function tab_label( string $slug, string $fallback_label ): string {

		if ( 'appearance' === $slug ) {
			return __( 'Appearance', 'gamestuff-blocks' );
		}

		if ( 'blocks' === $slug ) {
			return __( 'Blocks', 'gamestuff-blocks' );
		}

		return $fallback_label;
	}

	/**
	 * Render one form field per registered setting belonging to the
	 * given tab's group.
	 *
	 * @since 1.0.0
	 *
	 * @param string $tab Current tab slug, matched against each
	 *                    setting's registered 'group'.
	 * @return void
	 */
	private static function render_fields( string $tab ): void {

		$option_name = SettingsRegistry::option_name();

		$settings = array_filter(
			SettingsRegistry::all(),
			static fn( array $setting ): bool => $tab === $setting['group']
		);
		?>
		<table class="form-table" role="presentation">
			<tbody>
				<?php foreach ( $settings as $id => $setting ) : ?>
					<tr>
						<th scope="row">
							<label for="<?php echo esc_attr( $id ); ?>">
								<?php echo esc_html( $setting['label'] ); ?>
							</label>
						</th>
						<td>
							<?php self::render_field( $id, $setting, $option_name ); ?>
							<?php if ( '' !== $setting['description'] ) : ?>
								<p class="description"><?php echo esc_html( $setting['description'] ); ?></p>
							<?php endif; ?>
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
	 * itself. 'select' renders a plain `<select>` from the setting's
	 * registered 'options', likewise with no script dependency.
	 *
	 * @since 1.0.0
	 * @since 1.7.0 Added the 'select' type.
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

		if ( 'select' === $setting['type'] ) {
			printf( '<select id="%1$s" name="%2$s">', esc_attr( $id ), esc_attr( $name ) );

			foreach ( $setting['options'] as $option_value => $option_label ) {
				printf(
					'<option value="%1$s"%2$s>%3$s</option>',
					esc_attr( $option_value ),
					selected( $value, $option_value, false ),
					esc_html( $option_label )
				);
			}

			echo '</select>';
			return;
		}

		printf(
			'<input type="text" id="%1$s" name="%2$s" value="%3$s" class="regular-text" />',
			esc_attr( $id ),
			esc_attr( $name ),
			esc_attr( $value )
		);
	}

	/**
	 * Render the Blocks tab: one checkbox per block discovered by
	 * BlockRegistry, checked when that block is currently active.
	 *
	 * A hidden `_submitted` field guarantees this option's key is
	 * present in $_POST even if every checkbox ends up unchecked —
	 * see sanitize_active_blocks() for why that matters.
	 *
	 * @since 1.6.0
	 *
	 * @return void
	 */
	private static function render_blocks_fields(): void {

		$option_name = BlockRegistry::option_name();
		$blocks      = BlockRegistry::all();
		$top_level   = array_intersect_key( $blocks, array_flip( BlockRegistry::toggleable_slugs() ) );
		?>
		<p class="description">
			<?php esc_html_e( 'Disabled blocks are not registered at all: they are removed from the block inserter and their CSS/JavaScript are never loaded on the front end.', 'gamestuff-blocks' ); ?>
		</p>
		<input type="hidden" name="<?php echo esc_attr( $option_name ); ?>[_submitted]" value="1" />
		<table class="form-table" role="presentation">
			<tbody>
				<?php foreach ( $top_level as $slug => $block ) : ?>
					<?php $children = self::child_titles( $slug, $blocks ); ?>
					<tr>
						<th scope="row">
							<label for="<?php echo esc_attr( 'block-' . $slug ); ?>">
								<?php echo esc_html( $block['title'] ); ?>
							</label>
						</th>
						<td>
							<label>
								<input
									type="checkbox"
									id="<?php echo esc_attr( 'block-' . $slug ); ?>"
									name="<?php echo esc_attr( $option_name ); ?>[active][]"
									value="<?php echo esc_attr( $slug ); ?>"
									<?php checked( BlockRegistry::is_active( $slug ) ); ?>
								/>
								<?php esc_html_e( 'Active', 'gamestuff-blocks' ); ?>
							</label>
							<?php if ( array() !== $children ) : ?>
								<p class="description">
									<?php
									printf(
										/* translators: %s: comma-separated list of child block titles, e.g. "Accordion Item". */
										esc_html__( 'Includes: %s (follows this toggle automatically).', 'gamestuff-blocks' ),
										esc_html( implode( ', ', $children ) )
									);
									?>
								</p>
							<?php endif; ?>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
		<?php
	}

	/**
	 * Get the display titles of a top-level block's child blocks, if
	 * any — used to explain in the Blocks tab why a block like
	 * Accordion Item has no checkbox of its own.
	 *
	 * @since 1.6.0
	 *
	 * @param string                            $parent_slug Top-level block's slug.
	 * @param array<string, array<string, mixed>> $blocks     Full result of BlockRegistry::all().
	 * @return string[] Child block titles, in discovery order.
	 */
	private static function child_titles( string $parent_slug, array $blocks ): array {

		$parent_name = $blocks[ $parent_slug ]['name'] ?? null;

		if ( null === $parent_name ) {
			return array();
		}

		$titles = array();

		foreach ( $blocks as $block ) {
			if ( ( $block['parent'] ?? null ) === $parent_name ) {
				$titles[] = $block['title'];
			}
		}

		return $titles;
	}
}
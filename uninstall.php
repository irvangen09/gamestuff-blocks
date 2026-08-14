<?php
/**
 * Uninstall handler.
 *
 * Removes all data the plugin stored, when the user chooses to
 * delete it from the Plugins screen (not on simple deactivation —
 * see includes/Core/Deactivator.php for why that stays non-destructive).
 *
 * WordPress loads this file directly, without loading the main
 * plugin file first, so none of the plugin's classes or autoloader
 * are available here — this file is intentionally plain, dependency-free
 * PHP.
 *
 * @package GameStuff_Blocks
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/**
 * Delete every option this plugin stores, on the current site.
 *
 *
 * @return void
 */
function gamestuff_blocks_uninstall_delete_data(): void {

	delete_option( 'gamestuff_blocks_settings' );
	delete_option( 'gamestuff_blocks_active_blocks' );
	delete_option( 'gamestuff_blocks_version' );
}

if ( ! is_multisite() ) {
	gamestuff_blocks_uninstall_delete_data();
	return;
}

/**
 * Network install: the plugin may have been active on any number of
 * sites, each with its own copy of these options, so every site
 * needs to be visited individually.
 */
$site_ids = get_sites( array( 'fields' => 'ids' ) );

foreach ( $site_ids as $site_id ) {
	switch_to_blog( (int) $site_id );
	gamestuff_blocks_uninstall_delete_data();
	restore_current_blog();
}

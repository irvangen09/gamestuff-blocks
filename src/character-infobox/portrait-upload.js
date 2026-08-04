/**
 * Character Infobox — portrait upload control.
 *
 * Extracted from edit.js so the main Edit() function stays focused on
 * overall block layout, rather than the details of the Media Library
 * upload UI (click-to-open zone, empty-state placeholder, and the
 * Replace/Remove buttons). No behavior or markup change from the
 * previous inline version.
 */
import { __ } from '@wordpress/i18n';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Button, ResponsiveWrapper } from '@wordpress/components';

import { PORTRAIT_WIDTH, PORTRAIT_HEIGHT } from './constants';

export default function PortraitUpload( {
	portraitId,
	portraitUrl,
	onSelectImage,
	removeImage,
} ) {
	return (
		<MediaUploadCheck>
			<MediaUpload
				onSelect={ onSelectImage }
				allowedTypes={ [ 'image' ] }
				value={ portraitId }
				render={ ( { open } ) => (
					<>
						<div
							className="gs-portrait-clickzone"
							role="button"
							tabIndex={ 0 }
							onClick={ open }
							onKeyDown={ ( e ) => {
								if ( e.key === 'Enter' || e.key === ' ' ) {
									open();
								}
							} }
						>
							{ portraitUrl ? (
								<ResponsiveWrapper
									naturalWidth={ PORTRAIT_WIDTH }
									naturalHeight={ PORTRAIT_HEIGHT }
								>
									<img src={ portraitUrl } alt="" />
								</ResponsiveWrapper>
							) : (
								<div className="gs-portrait-placeholder">
									<span className="dashicons dashicons-camera" />
									<span>
										{ PORTRAIT_WIDTH } × { PORTRAIT_HEIGHT }
									</span>
								</div>
							) }
						</div>

						<div className="gs-upload-buttons">
							<Button variant="secondary" onClick={ open }>
								{ portraitId
									? __(
											'Replace Portrait',
											'gamestuff-blocks'
									  )
									: __(
											'Select Portrait',
											'gamestuff-blocks'
									  ) }
							</Button>

							{ portraitId > 0 && (
								<Button
									variant="link"
									isDestructive
									onClick={ removeImage }
								>
									{ __( 'Remove', 'gamestuff-blocks' ) }
								</Button>
							) }
						</div>
					</>
				) }
			/>
		</MediaUploadCheck>
	);
}

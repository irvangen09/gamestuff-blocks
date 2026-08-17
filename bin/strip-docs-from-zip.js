const path = require( 'node:path' );
const AdmZip = require( 'adm-zip' );

const ZIP_PATH = path.join( process.cwd(), 'gamestuff-blocks.zip' );

const ENTRIES_TO_REMOVE = [
	'gamestuff-blocks/CHANGELOG.md',
	'gamestuff-blocks/README.md',
	'gamestuff-blocks/LICENSE.md',
];

const zip = new AdmZip( ZIP_PATH );

for ( const entryName of ENTRIES_TO_REMOVE ) {
	if ( zip.getEntry( entryName ) ) {
		zip.deleteFile( entryName );
		console.log( `Removed \`${ entryName }\` from the package.` );
	}
}

zip.writeZip( ZIP_PATH );
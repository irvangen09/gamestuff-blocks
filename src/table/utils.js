// Alignment only takes visual effect for the Plain preset — Standard
// and Style 1 keep their own fixed alignment, Style 2 renders cards,
// not a header/column grid.
export function columnAlignStyle( col, preset ) {
	if ( 'plain' !== preset || ! col.align ) {
		return undefined;
	}

	return { textAlign: col.align };
}

// Plain's header defaults to left, matching WordPress core's own
// table — column alignment (when set) still overrides this, same as
// it does for body cells.
export function headerAlignStyle( col, preset ) {
	return (
		columnAlignStyle( col, preset ) ??
		( 'plain' === preset ? { textAlign: 'left' } : undefined )
	);
}
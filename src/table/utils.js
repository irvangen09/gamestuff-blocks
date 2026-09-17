// Alignment only takes visual effect for the Plain preset — Standard
// and Style 1 keep their own fixed alignment, Style 2 renders cards,
// not a header/column grid.
export function columnAlignStyle( col, preset ) {
	if ( 'plain' !== preset || ! col.align ) {
		return undefined;
	}

	return { textAlign: col.align };
}
### MathBox Changelog

0.0.4-dev

 * Make <array />, <matrix />, <voxel /> and <text /> auto-detect `null` dimensions from `data` if given.
 * Fix <text /> not parsing >1 string from an array.
 * Fix public `channels` on <text /> being 4 instead of 1.
 * Removed unused font properties from <retext />.
 * Fix final props being overwritable on initial set.
 * Rename <text expand={n} /> to <text sdf={n} /> (signed distance field) to avoid confusion with <label expand={n} />

0.0.3

 * New `docs/intro.md`, add nullable examples to `docs/primitives.md`.
 * Add `sizes` binding to <point /> to change per-point size.
 * New <mask /> pass for custom transition effects, remove clip leftover.
 * Fix <clock> reporting incorrect real time and delta.
 * Fix <step /> counting repeated stops as skips.
 * Fix docs on <transition> `durationEnter`/`Exit`.
 * Fix <scale /> not tracking span changes.
 * Fix color [r, g, b] syntax parser.
 * Remove children in reverse order to avoid reindexing.

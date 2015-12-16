### MathBox Changelog

0.0.5
 * ⚠️ Rename array `length` to `width` for consistency.
 * ⚠️ Reverse the polarity on `zOrder`, higher zOrder should be drawn later.
 * ⚠️ Rename resample/lerp `centeredWidth`, `centeredHeight`, ... to `centeredX`, `centeredY` for consistency.
 * ⚠️ Change data sampler to not auto-wrap/repeat since it was 2D only. Out-of-bounds sampling is now undefined unless you add `<repeat />` or `<clamp />` (works in 4D).
 * Add miter/round/bevel `join` prop for lines, with improved handling of degenerate cases in 3D.
 * Fix anchor logic on `<grow />` being applied to unpinned axes.
 * Add 'binary' / 'hold' ease to force a binary (halfway) or hold (to end) transition.
 * Flatten selector arrays recursively, e.g. `sources: [array1, "#array2"]` now works.
 * Refactor `<resample />` and `<lerp />` to handle relative sizes/padding correctly with uncentered sampling.
 * Add `<subdivide />` operator to lerp geometries non-evenly, see `test/subdivide.html` for uses.
 * Add `<clamp />` for clamp-to-edge sampling in 4D.
 * Round fractional sample indices for 3D/4D buffers to ensure correct alignment when resampling. Set `aligned: true` on `array`/`matrix`/... to disable this when integer lookups are guaranteed.
 * Fix bug when a text atlas is emptied completely.
 * Minor documentation improvements (basic API).

0.0.4

 * New `<readback />` sink that exposes internal readback functionality.
 * Make `<array />`, `<matrix />`, `<voxel />` and `<text />` auto-detect `null` dimensions from `data` if given.
 * Fix `<text />` not parsing >1 string from an array.
 * Fix public `channels` on `<text />` being 4 instead of 1.
 * Removed unused font properties from `<retext />`.
 * Fix final/const props being overwritable on initial set.
 * Rename `<text expand={n} />` to `<text sdf={n} />` (signed distance field) to avoid confusion with `<label expand={n} />`
 * Change default `<label />` color from black to gray to match other primitives.
 * Fix data array emitters for larger item sizes.
 * Add thunk lerper to animate data arrays on keyframe tracks.
 * Remove default zOrder on `<axis />` and `<grid />`.
 * Clean slate NPM dependencies.
 * Fix `gulp-rename` compatibility.
 * Improved axis, grid, helix, lerp, label, strip examples.
 * Improved idiomatic time examples.
 * New color cube, vertex color, fragment color, tiles and ortho examples.
 * Document instanced traits (e.g. `divideX`) and non-standard defaults.
 * Support fragment passes on unshaded geometry.
 * Added `lineBias` prop to set Z-bias between surface/face and its wireframe.
 * Allow passing modified STPQ coordinates from `<vertex />` to `<fragment />` (see `fragmentcolor.html` example)

0.0.3

 * New `docs/intro.md`, add nullable examples to `docs/primitives.md`.
 * Add `sizes` binding to `<point />` to change per-point size.
 * New `<mask />` pass for custom transition effects, remove clip leftover.
 * Fix `<clock>` reporting incorrect real time and delta.
 * Fix `<step />` counting repeated stops as skips.
 * Fix docs on `<transition>` `durationEnter`/`Exit`.
 * Fix `<scale />` not tracking span changes.
 * Fix color [r, g, b] syntax parser.
 * Remove children in reverse order to avoid reindexing.

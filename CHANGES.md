### MathBox Changelog

### 2.2.1
- Add Typescript support for live properties and `bind`. [#43](https://github.com/unconed/mathbox/pull/43)

### 2.2.0

- [#32](https://github.com/unconed/mathbox/pull/32) and [#34](https://github.com/unconed/mathbox/pull/34)Ported Steven's changes from [0.0.6-dev](https://github.com/unconed/mathbox/blob/dev/CHANGES.md):

    - When specifying `fps` on a data buffer, catch up correctly if starting late (e.g. on a slide)
    - Add `indices` and `channels` props to `<shader />` to match `<resample />`.
    - Add missing docs for line `width`.
    - Rename `expr` in script steps (steps, play, ...) to `bind` to avoid collision with `expr` prop.
    - Fix origin/range changes not being picked up
    - Force `<layer />` to flatten to an orthogonal view
    - Fix rendering of partially filled buffers
    - Make closed lines/vectors work properly
    - Make closed surfaces work properly
    - Add optional `normals` to `<surface />`
    - Add `<latch />` to control expr/data updates when conditions change
- [#33 Separate linting and tests in Github Actions](https://github.com/unconed/mathbox/pull/33)
- [#31 remove gulp-eslint](https://github.com/unconed/mathbox/pull/31)
- [#30 add developing.MD](https://github.com/unconed/mathbox/pull/30)

### 2.1.4

Some bugfixes:

- [Fix issue with shaded surfaces being too dark](https://github.com/unconed/mathbox/pull/26) Surface shading now looks like it did in 0.0.5. Previously both sides were being shaded as the backside.
- [Fix issue with gridlines on filled surfaces](https://github.com/unconed/mathbox/pull/27) Gridlines now appear as the surface's color if surface is unfilled, and as slightly darker if surfaces are filled.
- [Remove the releases directory](https://github.com/unconed/mathbox/pull/28) Old releases, including the zipped bundles, are available at https://github.com/unconed/mathbox/releases

#### 2.1.3

Some bugfixes:

- [do not call inspect if mathbox was destroyed](https://github.com/unconed/mathbox/pull/23) Fixes an issue where Mathbox would asynchronously error if instances were destroyed immediately after creation.
- [Add a Jupyter Notebook example](https://github.com/unconed/mathbox/pull/17) _Note: This currently uses an outdated version of Mathbox._
- [Fix sampling bug](https://gitgud.io/unconed/mathbox/-/merge_requests/36) Fixes a bug where `width`, `height`, and `depth` could be increased but not decreased
- Mathbox has been moved from GitGud to Github. Various CI/Development enhancements:
  - https://github.com/unconed/mathbox/pull/22, https://github.com/unconed/mathbox/pull/20, https://github.com/unconed/mathbox/pull/11

#### 2.1.2

- Typescript Improvements:
  - [Add typedefs](https://gitgud.io/unconed/mathbox/-/merge_requests/28/)
  - [Cc more types](https://gitgud.io/unconed/mathbox/-/merge_requests/29/)
  - [add placeholder type alias for options](https://gitgud.io/unconed/mathbox/-/merge_requests/30/)
  - [broad select type to include selections, node, str](https://gitgud.io/unconed/mathbox/-/merge_requests/32/)
  - [add emitter types](https://gitgud.io/unconed/mathbox/-/merge_requests/33/)
  - [make emitter params not optional](https://gitgud.io/unconed/mathbox/-/merge_requests/34/)
- Make mathbox work better with Webpack 5 Workflows: (See https://gitgud.io/unconed/mathbox/-/issues/20)
  - [Replace cssauron with css-select](https://gitgud.io/unconed/mathbox/-/merge_requests/25/)
  - [move shaders to js](https://gitgud.io/unconed/mathbox/-/merge_requests/24/)
  - [add selection tests](https://gitgud.io/unconed/mathbox/-/merge_requests/21/)
  - [Add shaders.js to the bundle, delete vendored gulp-jsify](https://gitgud.io/unconed/mathbox/-/merge_requests/20/)
  - [fix `npm run test`; run with karma+webpack](https://gitgud.io/unconed/mathbox/-/merge_requests/18/)
- Linting improvements:
  - [Remove final batch of lint warnings](https://gitgud.io/unconed/mathbox/-/merge_requests/23/)
  - [Enable linter rule to prefer const and let to var, prep for upgrade](https://gitgud.io/unconed/mathbox/-/merge_requests/15/)
  - [Fix last eslint warnings](https://gitgud.io/unconed/mathbox/-/merge_requests/14/)
- Miscellaneous
  - [Remove missing RGBFormat](https://gitgud.io/unconed/mathbox/-/merge_requests/17/)
  - [export mathbox.css](https://gitgud.io/unconed/mathbox/-/merge_requests/31/)
  - [Tidy config, update package.json fields](https://gitgud.io/unconed/mathbox/-/merge_requests/19/)
  - [Fix unmount error from dom.js](https://gitgud.io/unconed/mathbox/-/merge_requests/22/)
  - [fix docs command](https://gitgud.io/unconed/mathbox/-/merge_requests/27/)

#### 2.1.1

ported patches from the following open merge requests:

- https://gitgud.io/unconed/mathbox/-/merge_requests/11/
- https://gitgud.io/unconed/mathbox/-/merge_requests/10
- https://gitgud.io/unconed/mathbox/-/merge_requests/9
- https://gitgud.io/unconed/mathbox/-/merge_requests/8
- https://gitgud.io/unconed/mathbox/-/merge_requests/7
- https://gitgud.io/unconed/mathbox/-/merge_requests/6
- https://gitgud.io/unconed/mathbox/-/merge_requests/5

Thanks to @bobqwatsonsapphire, @carl00s01 and @Beddington for these fixes.

#### 0.0.5

- ⚠️ Rename array `length` to `width` for consistency.
- ⚠️ Reverse the polarity on `zOrder`, higher zOrder should be drawn later.
- ⚠️ Rename resample/lerp `centeredWidth`, `centeredHeight`, ... to `centeredX`, `centeredY` for consistency.
- ⚠️ Change data sampler to not auto-wrap/repeat since it was 2D only. Out-of-bounds sampling is now undefined unless you add `<repeat />` or `<clamp />` (works in 4D).
- Add miter/round/bevel `join` prop for lines, with improved handling of degenerate cases in 3D.
- Fix anchor logic on `<grow />` being applied to unpinned axes.
- Add 'binary' / 'hold' ease to force a binary (halfway) or hold (to end) transition.
- Flatten selector arrays recursively, e.g. `sources: [array1, "#array2"]` now works.
- Refactor `<resample />` and `<lerp />` to handle relative sizes/padding correctly with uncentered sampling.
- Add `<subdivide />` operator to lerp geometries non-evenly, see `test/subdivide.html` for uses.
- Add `<clamp />` for clamp-to-edge sampling in 4D.
- Round fractional sample indices for 3D/4D buffers to ensure correct alignment when resampling. Set `aligned: true` on `array`/`matrix`/... to disable this when integer lookups are guaranteed.
- Fix bug when a text atlas is emptied completely.
- Minor documentation improvements (basic API).

#### 0.0.4

- New `<readback />` sink that exposes internal readback functionality.
- Make `<array />`, `<matrix />`, `<voxel />` and `<text />` auto-detect `null` dimensions from `data` if given.
- Fix `<text />` not parsing >1 string from an array.
- Fix public `channels` on `<text />` being 4 instead of 1.
- Removed unused font properties from `<retext />`.
- Fix final/const props being overwritable on initial set.
- Rename `<text expand={n} />` to `<text sdf={n} />` (signed distance field) to avoid confusion with `<label expand={n} />`
- Change default `<label />` color from black to gray to match other primitives.
- Fix data array emitters for larger item sizes.
- Add thunk lerper to animate data arrays on keyframe tracks.
- Remove default zOrder on `<axis />` and `<grid />`.
- Clean slate NPM dependencies.
- Fix `gulp-rename` compatibility.
- Improved axis, grid, helix, lerp, label, strip examples.
- Improved idiomatic time examples.
- New color cube, vertex color, fragment color, tiles and ortho examples.
- Document instanced traits (e.g. `divideX`) and non-standard defaults.
- Support fragment passes on unshaded geometry.
- Added `lineBias` prop to set Z-bias between surface/face and its wireframe.
- Allow passing modified STPQ coordinates from `<vertex />` to `<fragment />` (see `fragmentcolor.html` example)

#### 0.0.3

- New `docs/intro.md`, add nullable examples to `docs/primitives.md`.
- Add `sizes` binding to `<point />` to change per-point size.
- New `<mask />` pass for custom transition effects, remove clip leftover.
- Fix `<clock>` reporting incorrect real time and delta.
- Fix `<step />` counting repeated stops as skips.
- Fix docs on `<transition>` `durationEnter`/`Exit`.
- Fix `<scale />` not tracking span changes.
- Fix color [r, g, b] syntax parser.
- Remove children in reverse order to avoid reindexing.

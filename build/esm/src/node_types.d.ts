import type { AreaEmitter, ArrayEmitter, IntervalEmitter, MatrixEmitter, VolumeEmitter, VoxelEmitter } from "./primitives/types/types_typed";
import { Traits as TraitsValue } from "./primitives/types/traits";
declare type Traits = typeof TraitsValue;
interface GetTraitsNode {
    id: ReturnType<Traits["node"]["id"]["validate"]>;
    classes: ReturnType<Traits["node"]["classes"]["validate"]>;
}
interface SetTraitsNode {
    /**
     * Unique ID
     * @default `null`
     * @example `"sampler"`
     */
    id?: Parameters<Traits["node"]["id"]["validate"]>[0];
    /**
     * Custom classes
     * @default `[]`
     * @example `["big"]`
     */
    classes?: Parameters<Traits["node"]["classes"]["validate"]>[0];
}
interface GetTraitsEntity {
    active: ReturnType<Traits["entity"]["active"]["validate"]>;
}
interface SetTraitsEntity {
    /**
     * Updates continuously
     * @default `true`
     */
    active?: Parameters<Traits["entity"]["active"]["validate"]>[0];
}
interface GetTraitsObject {
    visible: ReturnType<Traits["object"]["visible"]["validate"]>;
}
interface SetTraitsObject {
    /**
     * Visibility for rendering
     * @default `true`
     */
    visible?: Parameters<Traits["object"]["visible"]["validate"]>[0];
}
interface GetTraitsUnit {
    scale: ReturnType<Traits["unit"]["scale"]["validate"]>;
    fov: ReturnType<Traits["unit"]["fov"]["validate"]>;
    focus: ReturnType<Traits["unit"]["focus"]["validate"]>;
}
interface SetTraitsUnit {
    /**
     * (Vertical) Reference scale of viewport in pixels
     * @default `null`
     * @example `720`
     */
    scale?: Parameters<Traits["unit"]["scale"]["validate"]>[0];
    /**
     * (Vertical) Field-of-view to calibrate units for (degrees)
     * @default `null`
     * @example `60`
     */
    fov?: Parameters<Traits["unit"]["fov"]["validate"]>[0];
    /**
     * Camera focus distance in world units
     * @default `1`
     */
    focus?: Parameters<Traits["unit"]["focus"]["validate"]>[0];
}
interface GetTraitsSpan {
    range: ReturnType<Traits["span"]["range"]["validate"]>;
}
interface SetTraitsSpan {
    /**
     * Range on axis
     * @default `[-1, 1]`
     */
    range?: Parameters<Traits["span"]["range"]["validate"]>[0];
}
interface GetTraitsView {
    range: ReturnType<Traits["view"]["range"]["validate"]>;
}
interface SetTraitsView {
    /**
     * 4D range in view
     * @default `[[-1, 1], [-1, 1], [-1, 1], [-1, 1]]`
     */
    range?: Parameters<Traits["view"]["range"]["validate"]>[0];
}
interface GetTraitsView3 {
    position: ReturnType<Traits["view3"]["position"]["validate"]>;
    quaternion: ReturnType<Traits["view3"]["quaternion"]["validate"]>;
    rotation: ReturnType<Traits["view3"]["rotation"]["validate"]>;
    scale: ReturnType<Traits["view3"]["scale"]["validate"]>;
    eulerOrder: ReturnType<Traits["view3"]["eulerOrder"]["validate"]>;
}
interface SetTraitsView3 {
    /**
     * 3D Position
     * @default `[0, 0, 0]`
     */
    position?: Parameters<Traits["view3"]["position"]["validate"]>[0];
    /**
     * 3D Quaternion
     * @default `[0, 0, 0, 1]`
     */
    quaternion?: Parameters<Traits["view3"]["quaternion"]["validate"]>[0];
    /**
     * 3D Euler rotation
     * @default `[0, 0, 0]`
     */
    rotation?: Parameters<Traits["view3"]["rotation"]["validate"]>[0];
    /**
     * 3D Scale
     * @default `[1, 1, 1]`
     */
    scale?: Parameters<Traits["view3"]["scale"]["validate"]>[0];
    /**
     * Euler order
     * @default `xyz`
     */
    eulerOrder?: Parameters<Traits["view3"]["eulerOrder"]["validate"]>[0];
}
interface GetTraitsView4 {
    position: ReturnType<Traits["view4"]["position"]["validate"]>;
    scale: ReturnType<Traits["view4"]["scale"]["validate"]>;
}
interface SetTraitsView4 {
    /**
     * 4D Position
     * @default `[0, 0, 0, 0]`
     */
    position?: Parameters<Traits["view4"]["position"]["validate"]>[0];
    /**
     * 4D Scale
     * @default `[1, 1, 1, 1]`
     */
    scale?: Parameters<Traits["view4"]["scale"]["validate"]>[0];
}
interface GetTraitsLayer {
    depth: ReturnType<Traits["layer"]["depth"]["validate"]>;
    fit: ReturnType<Traits["layer"]["fit"]["validate"]>;
}
interface SetTraitsLayer {
    /**
     * 3D Depth
     * @default `1`
     */
    depth?: Parameters<Traits["layer"]["depth"]["validate"]>[0];
    /**
     * Fit to (contain, cover, x, y)
     * @default `y`
     */
    fit?: Parameters<Traits["layer"]["fit"]["validate"]>[0];
}
interface GetTraitsVertex {
    pass: ReturnType<Traits["vertex"]["pass"]["validate"]>;
}
interface SetTraitsVertex {
    /**
     * Vertex pass (data, view, world, eye)
     * @default `"view"`
     */
    pass?: Parameters<Traits["vertex"]["pass"]["validate"]>[0];
}
interface GetTraitsFragment {
    pass: ReturnType<Traits["fragment"]["pass"]["validate"]>;
    gamma: ReturnType<Traits["fragment"]["gamma"]["validate"]>;
}
interface SetTraitsFragment {
    /**
     * Fragment pass (color, light, rgba)
     * @default `"light"`
     */
    pass?: Parameters<Traits["fragment"]["pass"]["validate"]>[0];
    /**
     * Pass RGBA values in sRGB instead of linear RGB
     * @default `false`
     */
    gamma?: Parameters<Traits["fragment"]["gamma"]["validate"]>[0];
}
interface GetTraitsTransform3 {
    position: ReturnType<Traits["transform3"]["position"]["validate"]>;
    quaternion: ReturnType<Traits["transform3"]["quaternion"]["validate"]>;
    rotation: ReturnType<Traits["transform3"]["rotation"]["validate"]>;
    eulerOrder: ReturnType<Traits["transform3"]["eulerOrder"]["validate"]>;
    scale: ReturnType<Traits["transform3"]["scale"]["validate"]>;
    matrix: ReturnType<Traits["transform3"]["matrix"]["validate"]>;
}
interface SetTraitsTransform3 {
    /**
     * 3D Position
     * @default `[0, 0, 0]`
     */
    position?: Parameters<Traits["transform3"]["position"]["validate"]>[0];
    /**
     * 3D Quaternion
     * @default `[0, 0, 0, 1]`
     */
    quaternion?: Parameters<Traits["transform3"]["quaternion"]["validate"]>[0];
    /**
     * 3D Euler rotation
     * @default `[0, 0, 0]`
     */
    rotation?: Parameters<Traits["transform3"]["rotation"]["validate"]>[0];
    /**
     * 3D Euler order
     * @default `xyz`
     */
    eulerOrder?: Parameters<Traits["transform3"]["eulerOrder"]["validate"]>[0];
    /**
     * 3D Scale
     * @default `[1, 1, 1]`
     */
    scale?: Parameters<Traits["transform3"]["scale"]["validate"]>[0];
    /**
     * 3D Projective Matrix
     * @default `[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]`
     */
    matrix?: Parameters<Traits["transform3"]["matrix"]["validate"]>[0];
}
interface GetTraitsTransform4 {
    position: ReturnType<Traits["transform4"]["position"]["validate"]>;
    scale: ReturnType<Traits["transform4"]["scale"]["validate"]>;
    matrix: ReturnType<Traits["transform4"]["matrix"]["validate"]>;
}
interface SetTraitsTransform4 {
    /**
     * 4D Position
     * @default `[0, 0, 0, 0]`
     */
    position?: Parameters<Traits["transform4"]["position"]["validate"]>[0];
    /**
     * 4D Scale
     * @default `[1, 1, 1, 1]`
     */
    scale?: Parameters<Traits["transform4"]["scale"]["validate"]>[0];
    /**
     * 4D Affine Matrix
     * @default `[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]`
     */
    matrix?: Parameters<Traits["transform4"]["matrix"]["validate"]>[0];
}
interface GetTraitsCamera {
    proxy: ReturnType<Traits["camera"]["proxy"]["validate"]>;
    position: ReturnType<Traits["camera"]["position"]["validate"]>;
    quaternion: ReturnType<Traits["camera"]["quaternion"]["validate"]>;
    rotation: ReturnType<Traits["camera"]["rotation"]["validate"]>;
    lookAt: ReturnType<Traits["camera"]["lookAt"]["validate"]>;
    up: ReturnType<Traits["camera"]["up"]["validate"]>;
    eulerOrder: ReturnType<Traits["camera"]["eulerOrder"]["validate"]>;
    fov: ReturnType<Traits["camera"]["fov"]["validate"]>;
}
interface SetTraitsCamera {
    /**
     * Re-use existing camera
     * @default `false`
     */
    proxy?: Parameters<Traits["camera"]["proxy"]["validate"]>[0];
    /**
     * 3D Position
     * @default `null`
     * @example `[1, 2, 3]`
     */
    position?: Parameters<Traits["camera"]["position"]["validate"]>[0];
    /**
     * 3D Quaternion
     * @default `null`
     * @example `[0.707, 0, 0, 0.707]`
     */
    quaternion?: Parameters<Traits["camera"]["quaternion"]["validate"]>[0];
    /**
     * 3D Euler rotation
     * @default `null`
     * @example `[π/2, 0, 0]`
     */
    rotation?: Parameters<Traits["camera"]["rotation"]["validate"]>[0];
    /**
     * 3D Look at
     * @default `null`
     * @example `[2, 3, 4]`
     */
    lookAt?: Parameters<Traits["camera"]["lookAt"]["validate"]>[0];
    /**
     * 3D Up
     * @default `null`
     * @example `[0, 1, 0]`
     */
    up?: Parameters<Traits["camera"]["up"]["validate"]>[0];
    /**
     * 3D Euler order
     * @default `"xyz"`
     */
    eulerOrder?: Parameters<Traits["camera"]["eulerOrder"]["validate"]>[0];
    /**
     * Field-of-view (degrees)
     * @default `null`
     * @example `60`
     */
    fov?: Parameters<Traits["camera"]["fov"]["validate"]>[0];
}
interface GetTraitsPolar {
    bend: ReturnType<Traits["polar"]["bend"]["validate"]>;
    helix: ReturnType<Traits["polar"]["helix"]["validate"]>;
}
interface SetTraitsPolar {
    /**
     * Amount of polar bend
     * @default `1`
     */
    bend?: Parameters<Traits["polar"]["bend"]["validate"]>[0];
    /**
     * Expand into helix
     * @default `0`
     */
    helix?: Parameters<Traits["polar"]["helix"]["validate"]>[0];
}
interface GetTraitsSpherical {
    bend: ReturnType<Traits["spherical"]["bend"]["validate"]>;
}
interface SetTraitsSpherical {
    /**
     * Amount of spherical bend
     * @default `1`
     */
    bend?: Parameters<Traits["spherical"]["bend"]["validate"]>[0];
}
interface GetTraitsStereographic {
    bend: ReturnType<Traits["stereographic"]["bend"]["validate"]>;
}
interface SetTraitsStereographic {
    /**
     * Amount of stereographic bend
     * @default `1`
     */
    bend?: Parameters<Traits["stereographic"]["bend"]["validate"]>[0];
}
interface GetTraitsInterval {
    axis: ReturnType<Traits["interval"]["axis"]["validate"]>;
}
interface SetTraitsInterval {
    /**
     * Axis
     * @default `1`
     */
    axis?: Parameters<Traits["interval"]["axis"]["validate"]>[0];
}
interface GetTraitsArea {
    axes: ReturnType<Traits["area"]["axes"]["validate"]>;
}
interface SetTraitsArea {
    /**
     * Axis pair
     * @default `[1, 2]`
     */
    axes?: Parameters<Traits["area"]["axes"]["validate"]>[0];
}
interface GetTraitsVolume {
    axes: ReturnType<Traits["volume"]["axes"]["validate"]>;
}
interface SetTraitsVolume {
    /**
     * Axis triplet
     * @default `[1, 2, 3]`
     */
    axes?: Parameters<Traits["volume"]["axes"]["validate"]>[0];
}
interface GetTraitsOrigin {
    origin: ReturnType<Traits["origin"]["origin"]["validate"]>;
}
interface SetTraitsOrigin {
    /**
     * 4D Origin
     * @default `[0, 0, 0, 0]`
     */
    origin?: Parameters<Traits["origin"]["origin"]["validate"]>[0];
}
interface GetTraitsScale {
    divide: ReturnType<Traits["scale"]["divide"]["validate"]>;
    unit: ReturnType<Traits["scale"]["unit"]["validate"]>;
    base: ReturnType<Traits["scale"]["base"]["validate"]>;
    mode: ReturnType<Traits["scale"]["mode"]["validate"]>;
    start: ReturnType<Traits["scale"]["start"]["validate"]>;
    end: ReturnType<Traits["scale"]["end"]["validate"]>;
    zero: ReturnType<Traits["scale"]["zero"]["validate"]>;
    factor: ReturnType<Traits["scale"]["factor"]["validate"]>;
    nice: ReturnType<Traits["scale"]["nice"]["validate"]>;
}
interface SetTraitsScale {
    /**
     * Number of divisions
     * @default `10`
     */
    divide?: Parameters<Traits["scale"]["divide"]["validate"]>[0];
    /**
     * Reference unit
     * @default `1`
     */
    unit?: Parameters<Traits["scale"]["unit"]["validate"]>[0];
    /**
     * Power base for sub/super units
     * @default `10`
     */
    base?: Parameters<Traits["scale"]["base"]["validate"]>[0];
    /**
     * Scale type
     * @default `"linear"`
     */
    mode?: Parameters<Traits["scale"]["mode"]["validate"]>[0];
    /**
     * Include start
     * @default `true`
     */
    start?: Parameters<Traits["scale"]["start"]["validate"]>[0];
    /**
     * Include end
     * @default `true`
     */
    end?: Parameters<Traits["scale"]["end"]["validate"]>[0];
    /**
     * Include zero
     * @default `true`
     */
    zero?: Parameters<Traits["scale"]["zero"]["validate"]>[0];
    /**
     * Scale factor
     * @default `1`
     */
    factor?: Parameters<Traits["scale"]["factor"]["validate"]>[0];
    /**
     * Snap to nice numbers
     * @default `true`
     */
    nice?: Parameters<Traits["scale"]["nice"]["validate"]>[0];
}
interface GetTraitsGrid {
    lineX: ReturnType<Traits["grid"]["lineX"]["validate"]>;
    lineY: ReturnType<Traits["grid"]["lineY"]["validate"]>;
    crossed: ReturnType<Traits["grid"]["crossed"]["validate"]>;
    closedX: ReturnType<Traits["grid"]["closedX"]["validate"]>;
    closedY: ReturnType<Traits["grid"]["closedY"]["validate"]>;
}
interface SetTraitsGrid {
    /**
     * Draw X lines
     * @default `true`
     */
    lineX?: Parameters<Traits["grid"]["lineX"]["validate"]>[0];
    /**
     * Draw Y lines
     * @default `true`
     */
    lineY?: Parameters<Traits["grid"]["lineY"]["validate"]>[0];
    /**
     * UVWO map on matching axes
     * @default `true`
     */
    crossed?: Parameters<Traits["grid"]["crossed"]["validate"]>[0];
    /**
     * Close X lines
     * @default `false`
     */
    closedX?: Parameters<Traits["grid"]["closedX"]["validate"]>[0];
    /**
     * Close Y lines
     * @default `false`
     */
    closedY?: Parameters<Traits["grid"]["closedY"]["validate"]>[0];
}
interface GetTraitsAxis {
    detail: ReturnType<Traits["axis"]["detail"]["validate"]>;
    crossed: ReturnType<Traits["axis"]["crossed"]["validate"]>;
}
interface SetTraitsAxis {
    /**
     * Geometric detail
     * @default `1`
     */
    detail?: Parameters<Traits["axis"]["detail"]["validate"]>[0];
    /**
     * UVWO map on matching axis
     * @default `true`
     */
    crossed?: Parameters<Traits["axis"]["crossed"]["validate"]>[0];
}
interface GetTraitsData {
    data: ReturnType<Traits["data"]["data"]["validate"]>;
    expr: ReturnType<Traits["data"]["expr"]["validate"]>;
    bind: ReturnType<Traits["data"]["bind"]["validate"]>;
    live: ReturnType<Traits["data"]["live"]["validate"]>;
}
interface SetTraitsData {
    /**
     * Data array
     * @default `null`
     */
    data?: Parameters<Traits["data"]["data"]["validate"]>[0];
    /**
     * Data emitter expression
     * @default `null`
     */
    expr?: Parameters<Traits["data"]["expr"]["validate"]>[0];
    /**
     *
     */
    bind?: Parameters<Traits["data"]["bind"]["validate"]>[0];
    /**
     * Update continuously
     * @default `true`
     */
    live?: Parameters<Traits["data"]["live"]["validate"]>[0];
}
interface GetTraitsBuffer {
    channels: ReturnType<Traits["buffer"]["channels"]["validate"]>;
    items: ReturnType<Traits["buffer"]["items"]["validate"]>;
    fps: ReturnType<Traits["buffer"]["fps"]["validate"]>;
    hurry: ReturnType<Traits["buffer"]["hurry"]["validate"]>;
    limit: ReturnType<Traits["buffer"]["limit"]["validate"]>;
    realtime: ReturnType<Traits["buffer"]["realtime"]["validate"]>;
    observe: ReturnType<Traits["buffer"]["observe"]["validate"]>;
    aligned: ReturnType<Traits["buffer"]["aligned"]["validate"]>;
}
interface SetTraitsBuffer {
    /**
     * Number of channels
     * @default `4`
     */
    channels?: Parameters<Traits["buffer"]["channels"]["validate"]>[0];
    /**
     * Number of items
     * @default `4`
     */
    items?: Parameters<Traits["buffer"]["items"]["validate"]>[0];
    /**
     * Frames-per-second update rate
     * @default `null`
     * @example `60`
     */
    fps?: Parameters<Traits["buffer"]["fps"]["validate"]>[0];
    /**
     * Maximum frames to hurry per frame
     * @default `5`
     */
    hurry?: Parameters<Traits["buffer"]["hurry"]["validate"]>[0];
    /**
     * Maximum frames to track
     * @default `60`
     */
    limit?: Parameters<Traits["buffer"]["limit"]["validate"]>[0];
    /**
     * Run on real time, not clock time
     * @default `false`
     */
    realtime?: Parameters<Traits["buffer"]["realtime"]["validate"]>[0];
    /**
     * Pass clock time to data
     * @default `false`
     */
    observe?: Parameters<Traits["buffer"]["observe"]["validate"]>[0];
    /**
     * Use (fast) integer lookups
     * @default `false`
     */
    aligned?: Parameters<Traits["buffer"]["aligned"]["validate"]>[0];
}
interface GetTraitsSampler {
    centered: ReturnType<Traits["sampler"]["centered"]["validate"]>;
    padding: ReturnType<Traits["sampler"]["padding"]["validate"]>;
}
interface SetTraitsSampler {
    /**
     * Centered instead of corner sampling
     * @default `false`
     */
    centered?: Parameters<Traits["sampler"]["centered"]["validate"]>[0];
    /**
     * Number of samples padding
     * @default `0`
     */
    padding?: Parameters<Traits["sampler"]["padding"]["validate"]>[0];
}
interface GetTraitsArray {
    width: ReturnType<Traits["array"]["width"]["validate"]>;
    bufferWidth: ReturnType<Traits["array"]["bufferWidth"]["validate"]>;
    history: ReturnType<Traits["array"]["history"]["validate"]>;
}
interface SetTraitsArray {
    /**
     * Array width
     * @default `1`
     */
    width?: Parameters<Traits["array"]["width"]["validate"]>[0];
    /**
     * Array buffer width
     * @default `1`
     */
    bufferWidth?: Parameters<Traits["array"]["bufferWidth"]["validate"]>[0];
    /**
     * Array history
     * @default `1`
     */
    history?: Parameters<Traits["array"]["history"]["validate"]>[0];
}
interface GetTraitsMatrix {
    width: ReturnType<Traits["matrix"]["width"]["validate"]>;
    height: ReturnType<Traits["matrix"]["height"]["validate"]>;
    history: ReturnType<Traits["matrix"]["history"]["validate"]>;
    bufferWidth: ReturnType<Traits["matrix"]["bufferWidth"]["validate"]>;
    bufferHeight: ReturnType<Traits["matrix"]["bufferHeight"]["validate"]>;
}
interface SetTraitsMatrix {
    /**
     * Matrix width
     * @default `1`
     */
    width?: Parameters<Traits["matrix"]["width"]["validate"]>[0];
    /**
     * Matrix height
     * @default `1`
     */
    height?: Parameters<Traits["matrix"]["height"]["validate"]>[0];
    /**
     * Matrix history
     * @default `1`
     */
    history?: Parameters<Traits["matrix"]["history"]["validate"]>[0];
    /**
     * Matrix buffer width
     * @default `1`
     */
    bufferWidth?: Parameters<Traits["matrix"]["bufferWidth"]["validate"]>[0];
    /**
     * Matrix buffer height
     * @default `1`
     */
    bufferHeight?: Parameters<Traits["matrix"]["bufferHeight"]["validate"]>[0];
}
interface GetTraitsVoxel {
    width: ReturnType<Traits["voxel"]["width"]["validate"]>;
    height: ReturnType<Traits["voxel"]["height"]["validate"]>;
    depth: ReturnType<Traits["voxel"]["depth"]["validate"]>;
    bufferWidth: ReturnType<Traits["voxel"]["bufferWidth"]["validate"]>;
    bufferHeight: ReturnType<Traits["voxel"]["bufferHeight"]["validate"]>;
    bufferDepth: ReturnType<Traits["voxel"]["bufferDepth"]["validate"]>;
}
interface SetTraitsVoxel {
    /**
     * Voxel width
     * @default `1`
     */
    width?: Parameters<Traits["voxel"]["width"]["validate"]>[0];
    /**
     * Voxel height
     * @default `1`
     */
    height?: Parameters<Traits["voxel"]["height"]["validate"]>[0];
    /**
     * Voxel depth
     * @default `1`
     */
    depth?: Parameters<Traits["voxel"]["depth"]["validate"]>[0];
    /**
     * Voxel buffer width
     * @default `1`
     */
    bufferWidth?: Parameters<Traits["voxel"]["bufferWidth"]["validate"]>[0];
    /**
     * Voxel buffer height
     * @default `1`
     */
    bufferHeight?: Parameters<Traits["voxel"]["bufferHeight"]["validate"]>[0];
    /**
     * Voxel buffer depth
     * @default `1`
     */
    bufferDepth?: Parameters<Traits["voxel"]["bufferDepth"]["validate"]>[0];
}
interface GetTraitsStyle {
    opacity: ReturnType<Traits["style"]["opacity"]["validate"]>;
    color: ReturnType<Traits["style"]["color"]["validate"]>;
    blending: ReturnType<Traits["style"]["blending"]["validate"]>;
    zWrite: ReturnType<Traits["style"]["zWrite"]["validate"]>;
    zTest: ReturnType<Traits["style"]["zTest"]["validate"]>;
    zIndex: ReturnType<Traits["style"]["zIndex"]["validate"]>;
    zBias: ReturnType<Traits["style"]["zBias"]["validate"]>;
    zOrder: ReturnType<Traits["style"]["zOrder"]["validate"]>;
}
interface SetTraitsStyle {
    /**
     * Opacity
     * @default `1`
     */
    opacity?: Parameters<Traits["style"]["opacity"]["validate"]>[0];
    /**
     * Color
     * @default `"rgb(128, 128, 128)"`
     */
    color?: Parameters<Traits["style"]["color"]["validate"]>[0];
    /**
     * Blending mode ('no, normal, add, subtract, multiply)
     * @default `"normal"`
     */
    blending?: Parameters<Traits["style"]["blending"]["validate"]>[0];
    /**
     * Write Z buffer
     * @default `true`
     */
    zWrite?: Parameters<Traits["style"]["zWrite"]["validate"]>[0];
    /**
     * Test Z buffer
     * @default `true`
     */
    zTest?: Parameters<Traits["style"]["zTest"]["validate"]>[0];
    /**
     * Z-Index (2D stacking)
     * @default `0`
     */
    zIndex?: Parameters<Traits["style"]["zIndex"]["validate"]>[0];
    /**
     * Z-Bias (3D stacking)
     * @default `0`
     */
    zBias?: Parameters<Traits["style"]["zBias"]["validate"]>[0];
    /**
     * Z-Order (drawing order)
     * @default `null`
     * @example `2`
     */
    zOrder?: Parameters<Traits["style"]["zOrder"]["validate"]>[0];
}
interface GetTraitsGeometry {
    points: ReturnType<Traits["geometry"]["points"]["validate"]>;
    colors: ReturnType<Traits["geometry"]["colors"]["validate"]>;
}
interface SetTraitsGeometry {
    /**
     * Points data source
     * @default `<`
     */
    points?: Parameters<Traits["geometry"]["points"]["validate"]>[0];
    /**
     * Colors data source
     * @default `null`
     * @example `"#colors"`
     */
    colors?: Parameters<Traits["geometry"]["colors"]["validate"]>[0];
}
interface GetTraitsPoint {
    size: ReturnType<Traits["point"]["size"]["validate"]>;
    sizes: ReturnType<Traits["point"]["sizes"]["validate"]>;
    shape: ReturnType<Traits["point"]["shape"]["validate"]>;
    optical: ReturnType<Traits["point"]["optical"]["validate"]>;
    fill: ReturnType<Traits["point"]["fill"]["validate"]>;
    depth: ReturnType<Traits["point"]["depth"]["validate"]>;
}
interface SetTraitsPoint {
    /**
     * Point size
     * @default `4`
     */
    size?: Parameters<Traits["point"]["size"]["validate"]>[0];
    /**
     * Point sizes data source
     * @default `null`
     * @example `"#sizes"`
     */
    sizes?: Parameters<Traits["point"]["sizes"]["validate"]>[0];
    /**
     * Point shape (circle, square, diamond, up, down, left, right)
     * @default `"circle"`
     */
    shape?: Parameters<Traits["point"]["shape"]["validate"]>[0];
    /**
     * Optical or exact sizing
     * @default `true`
     */
    optical?: Parameters<Traits["point"]["optical"]["validate"]>[0];
    /**
     * Fill shape
     * @default `true`
     */
    fill?: Parameters<Traits["point"]["fill"]["validate"]>[0];
    /**
     * Depth scaling
     * @default `1`
     */
    depth?: Parameters<Traits["point"]["depth"]["validate"]>[0];
}
interface GetTraitsLine {
    width: ReturnType<Traits["line"]["width"]["validate"]>;
    depth: ReturnType<Traits["line"]["depth"]["validate"]>;
    join: ReturnType<Traits["line"]["join"]["validate"]>;
    stroke: ReturnType<Traits["line"]["stroke"]["validate"]>;
    proximity: ReturnType<Traits["line"]["proximity"]["validate"]>;
    closed: ReturnType<Traits["line"]["closed"]["validate"]>;
}
interface SetTraitsLine {
    /**
     * Line width
     * @default `2`
     */
    width?: Parameters<Traits["line"]["width"]["validate"]>[0];
    /**
     * Depth scaling
     * @default `1`
     */
    depth?: Parameters<Traits["line"]["depth"]["validate"]>[0];
    /**
     *
     */
    join?: Parameters<Traits["line"]["join"]["validate"]>[0];
    /**
     * Line stroke (solid, dotted, dashed)
     * @default `"solid"`
     */
    stroke?: Parameters<Traits["line"]["stroke"]["validate"]>[0];
    /**
     * Proximity threshold
     * @default `null`
     * @example `10`
     */
    proximity?: Parameters<Traits["line"]["proximity"]["validate"]>[0];
    /**
     * Close line
     * @default `false`
     */
    closed?: Parameters<Traits["line"]["closed"]["validate"]>[0];
}
interface GetTraitsMesh {
    fill: ReturnType<Traits["mesh"]["fill"]["validate"]>;
    shaded: ReturnType<Traits["mesh"]["shaded"]["validate"]>;
    map: ReturnType<Traits["mesh"]["map"]["validate"]>;
    lineBias: ReturnType<Traits["mesh"]["lineBias"]["validate"]>;
}
interface SetTraitsMesh {
    /**
     * Fill mesh
     * @default `true`
     */
    fill?: Parameters<Traits["mesh"]["fill"]["validate"]>[0];
    /**
     * Shade mesh
     * @default `false`
     */
    shaded?: Parameters<Traits["mesh"]["shaded"]["validate"]>[0];
    /**
     * Texture map source
     * @default `null`
     * @example `"#map"`
     */
    map?: Parameters<Traits["mesh"]["map"]["validate"]>[0];
    /**
     * Z-Bias for lines on fill
     * @default `5`
     */
    lineBias?: Parameters<Traits["mesh"]["lineBias"]["validate"]>[0];
}
interface GetTraitsStrip {
    line: ReturnType<Traits["strip"]["line"]["validate"]>;
}
interface SetTraitsStrip {
    /**
     * Draw line
     * @default `false`
     */
    line?: Parameters<Traits["strip"]["line"]["validate"]>[0];
}
interface GetTraitsFace {
    line: ReturnType<Traits["face"]["line"]["validate"]>;
}
interface SetTraitsFace {
    /**
     * Draw line
     * @default `false`
     */
    line?: Parameters<Traits["face"]["line"]["validate"]>[0];
}
interface GetTraitsArrow {
    size: ReturnType<Traits["arrow"]["size"]["validate"]>;
    start: ReturnType<Traits["arrow"]["start"]["validate"]>;
    end: ReturnType<Traits["arrow"]["end"]["validate"]>;
}
interface SetTraitsArrow {
    /**
     * Arrow size
     * @default `3`
     */
    size?: Parameters<Traits["arrow"]["size"]["validate"]>[0];
    /**
     * Draw start arrow
     * @default `true`
     */
    start?: Parameters<Traits["arrow"]["start"]["validate"]>[0];
    /**
     * Draw end arrow
     * @default `true`
     */
    end?: Parameters<Traits["arrow"]["end"]["validate"]>[0];
}
interface GetTraitsTicks {
    normal: ReturnType<Traits["ticks"]["normal"]["validate"]>;
    size: ReturnType<Traits["ticks"]["size"]["validate"]>;
    epsilon: ReturnType<Traits["ticks"]["epsilon"]["validate"]>;
}
interface SetTraitsTicks {
    /**
     * Normal for reference plane
     * @default `true`
     */
    normal?: Parameters<Traits["ticks"]["normal"]["validate"]>[0];
    /**
     * Tick size
     * @default `10`
     */
    size?: Parameters<Traits["ticks"]["size"]["validate"]>[0];
    /**
     * Tick epsilon
     * @default `0.0001`
     */
    epsilon?: Parameters<Traits["ticks"]["epsilon"]["validate"]>[0];
}
interface GetTraitsAttach {
    offset: ReturnType<Traits["attach"]["offset"]["validate"]>;
    snap: ReturnType<Traits["attach"]["snap"]["validate"]>;
    depth: ReturnType<Traits["attach"]["depth"]["validate"]>;
}
interface SetTraitsAttach {
    /**
     * 2D offset
     * @default `[0, -20]`
     */
    offset?: Parameters<Traits["attach"]["offset"]["validate"]>[0];
    /**
     * Snap to pixel
     * @default `false`
     */
    snap?: Parameters<Traits["attach"]["snap"]["validate"]>[0];
    /**
     * Depth scaling
     * @default `0`
     */
    depth?: Parameters<Traits["attach"]["depth"]["validate"]>[0];
}
interface GetTraitsFormat {
    digits: ReturnType<Traits["format"]["digits"]["validate"]>;
    data: ReturnType<Traits["format"]["data"]["validate"]>;
    expr: ReturnType<Traits["format"]["expr"]["validate"]>;
    live: ReturnType<Traits["format"]["live"]["validate"]>;
}
interface SetTraitsFormat {
    /**
     * Digits of precision
     * @default `null`
     * @example `2`
     */
    digits?: Parameters<Traits["format"]["digits"]["validate"]>[0];
    /**
     * Array of labels
     * @default `null`
     * @example `["Grumpy", "Sleepy", "Sneezy"]`
     */
    data?: Parameters<Traits["format"]["data"]["validate"]>[0];
    /**
     * Label formatter expression
     * @default `null`
     */
    expr?: Parameters<Traits["format"]["expr"]["validate"]>[0];
    /**
     * Update continuously
     * @default `true`
     */
    live?: Parameters<Traits["format"]["live"]["validate"]>[0];
}
interface GetTraitsFont {
    font: ReturnType<Traits["font"]["font"]["validate"]>;
    style: ReturnType<Traits["font"]["style"]["validate"]>;
    variant: ReturnType<Traits["font"]["variant"]["validate"]>;
    weight: ReturnType<Traits["font"]["weight"]["validate"]>;
    detail: ReturnType<Traits["font"]["detail"]["validate"]>;
    sdf: ReturnType<Traits["font"]["sdf"]["validate"]>;
}
interface SetTraitsFont {
    /**
     * Font family
     * @default `"sans-serif"`
     */
    font?: Parameters<Traits["font"]["font"]["validate"]>[0];
    /**
     * Font style
     * @default `""`
     * @example `"italic"`
     */
    style?: Parameters<Traits["font"]["style"]["validate"]>[0];
    /**
     * Font variant
     * @default `""`
     * @example `"small-caps"`
     */
    variant?: Parameters<Traits["font"]["variant"]["validate"]>[0];
    /**
     * Font weight
     * @default `""`
     * @example `"bold"`
     */
    weight?: Parameters<Traits["font"]["weight"]["validate"]>[0];
    /**
     * Font detail
     * @default `24`
     */
    detail?: Parameters<Traits["font"]["detail"]["validate"]>[0];
    /**
     * Signed distance field range
     * @default `5`
     */
    sdf?: Parameters<Traits["font"]["sdf"]["validate"]>[0];
}
interface GetTraitsLabel {
    text: ReturnType<Traits["label"]["text"]["validate"]>;
    size: ReturnType<Traits["label"]["size"]["validate"]>;
    outline: ReturnType<Traits["label"]["outline"]["validate"]>;
    expand: ReturnType<Traits["label"]["expand"]["validate"]>;
    background: ReturnType<Traits["label"]["background"]["validate"]>;
}
interface SetTraitsLabel {
    /**
     * Text source
     * @default `"<"`
     */
    text?: Parameters<Traits["label"]["text"]["validate"]>[0];
    /**
     * Text size
     * @default `16`
     */
    size?: Parameters<Traits["label"]["size"]["validate"]>[0];
    /**
     * Outline size
     * @default `2`
     */
    outline?: Parameters<Traits["label"]["outline"]["validate"]>[0];
    /**
     * Expand glyphs
     * @default `0`
     */
    expand?: Parameters<Traits["label"]["expand"]["validate"]>[0];
    /**
     * Outline background
     * @default `"rgb(255, 255, 255)"`
     */
    background?: Parameters<Traits["label"]["background"]["validate"]>[0];
}
interface GetTraitsOverlay {
    opacity: ReturnType<Traits["overlay"]["opacity"]["validate"]>;
    zIndex: ReturnType<Traits["overlay"]["zIndex"]["validate"]>;
}
interface SetTraitsOverlay {
    /**
     * Opacity
     * @default `1`
     */
    opacity?: Parameters<Traits["overlay"]["opacity"]["validate"]>[0];
    /**
     * Z-Index (2D stacking)
     * @default `0`
     */
    zIndex?: Parameters<Traits["overlay"]["zIndex"]["validate"]>[0];
}
interface GetTraitsDom {
    points: ReturnType<Traits["dom"]["points"]["validate"]>;
    html: ReturnType<Traits["dom"]["html"]["validate"]>;
    size: ReturnType<Traits["dom"]["size"]["validate"]>;
    outline: ReturnType<Traits["dom"]["outline"]["validate"]>;
    zoom: ReturnType<Traits["dom"]["zoom"]["validate"]>;
    color: ReturnType<Traits["dom"]["color"]["validate"]>;
    attributes: ReturnType<Traits["dom"]["attributes"]["validate"]>;
    pointerEvents: ReturnType<Traits["dom"]["pointerEvents"]["validate"]>;
}
interface SetTraitsDom {
    /**
     * Points data source
     * @default `"<"`
     */
    points?: Parameters<Traits["dom"]["points"]["validate"]>[0];
    /**
     * HTML data source
     * @default `"<"`
     */
    html?: Parameters<Traits["dom"]["html"]["validate"]>[0];
    /**
     * Text size
     * @default `16`
     */
    size?: Parameters<Traits["dom"]["size"]["validate"]>[0];
    /**
     * Outline size
     * @default `2`
     */
    outline?: Parameters<Traits["dom"]["outline"]["validate"]>[0];
    /**
     * HTML zoom
     * @default `1`
     */
    zoom?: Parameters<Traits["dom"]["zoom"]["validate"]>[0];
    /**
     * Color
     * @default `"rgb(255, 255, 255)"`
     */
    color?: Parameters<Traits["dom"]["color"]["validate"]>[0];
    /**
     * HTML attributes
     * @default `null`
     * @example `{"style": {"color": "red"}}`
     */
    attributes?: Parameters<Traits["dom"]["attributes"]["validate"]>[0];
    /**
     * Allow pointer events
     * @default `false`
     */
    pointerEvents?: Parameters<Traits["dom"]["pointerEvents"]["validate"]>[0];
}
interface GetTraitsTexture {
    minFilter: ReturnType<Traits["texture"]["minFilter"]["validate"]>;
    magFilter: ReturnType<Traits["texture"]["magFilter"]["validate"]>;
    type: ReturnType<Traits["texture"]["type"]["validate"]>;
}
interface SetTraitsTexture {
    /**
     * Texture minification filtering
     * @default `"nearest"`
     */
    minFilter?: Parameters<Traits["texture"]["minFilter"]["validate"]>[0];
    /**
     * Texture magnification filtering
     * @default `"nearest"`
     */
    magFilter?: Parameters<Traits["texture"]["magFilter"]["validate"]>[0];
    /**
     * Texture data type
     * @default `"float"`
     */
    type?: Parameters<Traits["texture"]["type"]["validate"]>[0];
}
interface GetTraitsShader {
    sources: ReturnType<Traits["shader"]["sources"]["validate"]>;
    language: ReturnType<Traits["shader"]["language"]["validate"]>;
    code: ReturnType<Traits["shader"]["code"]["validate"]>;
    uniforms: ReturnType<Traits["shader"]["uniforms"]["validate"]>;
}
interface SetTraitsShader {
    /**
     * Sampler sources
     * @default `null`
     * @example `["#pressure", "#divergence"]`
     */
    sources?: Parameters<Traits["shader"]["sources"]["validate"]>[0];
    /**
     * Shader language
     * @default `"glsl"`
     */
    language?: Parameters<Traits["shader"]["language"]["validate"]>[0];
    /**
     * Shader code
     * @default `""`
     */
    code?: Parameters<Traits["shader"]["code"]["validate"]>[0];
    /**
     * Shader uniform objects (three.js style)
     * @default `null`
     * @example `{ time: { type: 'f', value: 3 }}`
     */
    uniforms?: Parameters<Traits["shader"]["uniforms"]["validate"]>[0];
}
interface GetTraitsInclude {
    shader: ReturnType<Traits["include"]["shader"]["validate"]>;
}
interface SetTraitsInclude {
    /**
     * Shader to use
     * @default `"<"`
     */
    shader?: Parameters<Traits["include"]["shader"]["validate"]>[0];
}
interface GetTraitsOperator {
    source: ReturnType<Traits["operator"]["source"]["validate"]>;
}
interface SetTraitsOperator {
    /**
     * Input source
     * @default `"<"`
     */
    source?: Parameters<Traits["operator"]["source"]["validate"]>[0];
}
interface GetTraitsSpread {
    unit: ReturnType<Traits["spread"]["unit"]["validate"]>;
    items: ReturnType<Traits["spread"]["items"]["validate"]>;
    width: ReturnType<Traits["spread"]["width"]["validate"]>;
    height: ReturnType<Traits["spread"]["height"]["validate"]>;
    depth: ReturnType<Traits["spread"]["depth"]["validate"]>;
    alignItems: ReturnType<Traits["spread"]["alignItems"]["validate"]>;
    alignWidth: ReturnType<Traits["spread"]["alignWidth"]["validate"]>;
    alignHeight: ReturnType<Traits["spread"]["alignHeight"]["validate"]>;
    alignDepth: ReturnType<Traits["spread"]["alignDepth"]["validate"]>;
}
interface SetTraitsSpread {
    /**
     * Spread per item (absolute) or array (relative)
     * @default `"relative"`
     */
    unit?: Parameters<Traits["spread"]["unit"]["validate"]>[0];
    /**
     * Items offset
     * @default `null`
     * @example `[1.5, 0, 0, 0]`
     */
    items?: Parameters<Traits["spread"]["items"]["validate"]>[0];
    /**
     * Width offset
     * @default `null`
     * @example `[1.5, 0, 0, 0]`
     */
    width?: Parameters<Traits["spread"]["width"]["validate"]>[0];
    /**
     * Height offset
     * @default `null`
     * @example `[1.5, 0, 0, 0]`
     */
    height?: Parameters<Traits["spread"]["height"]["validate"]>[0];
    /**
     * Depth offset
     * @default `null`
     * @example `[1.5, 0, 0, 0]`
     */
    depth?: Parameters<Traits["spread"]["depth"]["validate"]>[0];
    /**
     * Items alignment
     * @default `0`
     */
    alignItems?: Parameters<Traits["spread"]["alignItems"]["validate"]>[0];
    /**
     * Width alignment
     * @default `0`
     */
    alignWidth?: Parameters<Traits["spread"]["alignWidth"]["validate"]>[0];
    /**
     * Height alignment
     * @default `0`
     */
    alignHeight?: Parameters<Traits["spread"]["alignHeight"]["validate"]>[0];
    /**
     * Depth alignment
     * @default `0`
     */
    alignDepth?: Parameters<Traits["spread"]["alignDepth"]["validate"]>[0];
}
interface GetTraitsGrow {
    scale: ReturnType<Traits["grow"]["scale"]["validate"]>;
    items: ReturnType<Traits["grow"]["items"]["validate"]>;
    width: ReturnType<Traits["grow"]["width"]["validate"]>;
    height: ReturnType<Traits["grow"]["height"]["validate"]>;
    depth: ReturnType<Traits["grow"]["depth"]["validate"]>;
}
interface SetTraitsGrow {
    /**
     * Scale factor
     * @default `1`
     */
    scale?: Parameters<Traits["grow"]["scale"]["validate"]>[0];
    /**
     * Items alignment
     * @default `null`
     * @example `0`
     */
    items?: Parameters<Traits["grow"]["items"]["validate"]>[0];
    /**
     * Width alignment
     * @default `null`
     * @example `0`
     */
    width?: Parameters<Traits["grow"]["width"]["validate"]>[0];
    /**
     * Height alignment
     * @default `null`
     * @example `0`
     */
    height?: Parameters<Traits["grow"]["height"]["validate"]>[0];
    /**
     * Depth alignment
     * @default `null`
     * @example `0`
     */
    depth?: Parameters<Traits["grow"]["depth"]["validate"]>[0];
}
interface GetTraitsSplit {
    order: ReturnType<Traits["split"]["order"]["validate"]>;
    axis: ReturnType<Traits["split"]["axis"]["validate"]>;
    length: ReturnType<Traits["split"]["length"]["validate"]>;
    overlap: ReturnType<Traits["split"]["overlap"]["validate"]>;
}
interface SetTraitsSplit {
    /**
     * Axis order
     * @default `"wxyz"`
     */
    order?: Parameters<Traits["split"]["order"]["validate"]>[0];
    /**
     * Axis to split
     * @default `null`
     * @example `x`
     */
    axis?: Parameters<Traits["split"]["axis"]["validate"]>[0];
    /**
     * Tuple length
     * @default `1`
     */
    length?: Parameters<Traits["split"]["length"]["validate"]>[0];
    /**
     * Tuple overlap
     * @default `1`
     */
    overlap?: Parameters<Traits["split"]["overlap"]["validate"]>[0];
}
interface GetTraitsJoin {
    order: ReturnType<Traits["join"]["order"]["validate"]>;
    axis: ReturnType<Traits["join"]["axis"]["validate"]>;
    overlap: ReturnType<Traits["join"]["overlap"]["validate"]>;
}
interface SetTraitsJoin {
    /**
     * Axis order
     * @default `"wxyz"`
     */
    order?: Parameters<Traits["join"]["order"]["validate"]>[0];
    /**
     * Axis to join
     * @default `null`
     * @example `x`
     */
    axis?: Parameters<Traits["join"]["axis"]["validate"]>[0];
    /**
     * Tuple overlap
     * @default `1`
     */
    overlap?: Parameters<Traits["join"]["overlap"]["validate"]>[0];
}
interface GetTraitsSwizzle {
    order: ReturnType<Traits["swizzle"]["order"]["validate"]>;
}
interface SetTraitsSwizzle {
    /**
     * Swizzle order
     * @default `xyzw`
     */
    order?: Parameters<Traits["swizzle"]["order"]["validate"]>[0];
}
interface GetTraitsTranspose {
    order: ReturnType<Traits["transpose"]["order"]["validate"]>;
}
interface SetTraitsTranspose {
    /**
     * Transpose order
     * @default `xyzw`
     */
    order?: Parameters<Traits["transpose"]["order"]["validate"]>[0];
}
interface GetTraitsRepeat {
    items: ReturnType<Traits["repeat"]["items"]["validate"]>;
    width: ReturnType<Traits["repeat"]["width"]["validate"]>;
    height: ReturnType<Traits["repeat"]["height"]["validate"]>;
    depth: ReturnType<Traits["repeat"]["depth"]["validate"]>;
}
interface SetTraitsRepeat {
    /**
     * Repeat items
     * @default `1`
     */
    items?: Parameters<Traits["repeat"]["items"]["validate"]>[0];
    /**
     * Repeat width
     * @default `1`
     */
    width?: Parameters<Traits["repeat"]["width"]["validate"]>[0];
    /**
     * Repeat height
     * @default `1`
     */
    height?: Parameters<Traits["repeat"]["height"]["validate"]>[0];
    /**
     * Repeat depth
     * @default `1`
     */
    depth?: Parameters<Traits["repeat"]["depth"]["validate"]>[0];
}
interface GetTraitsSlice {
    items: ReturnType<Traits["slice"]["items"]["validate"]>;
    width: ReturnType<Traits["slice"]["width"]["validate"]>;
    height: ReturnType<Traits["slice"]["height"]["validate"]>;
    depth: ReturnType<Traits["slice"]["depth"]["validate"]>;
}
interface SetTraitsSlice {
    /**
     * Slice from, to items (excluding to)
     * @default `null`
     * @example `[2, 4]`
     */
    items?: Parameters<Traits["slice"]["items"]["validate"]>[0];
    /**
     * Slice from, to width (excluding to)
     * @default `null`
     * @example `[2, 4]`
     */
    width?: Parameters<Traits["slice"]["width"]["validate"]>[0];
    /**
     * Slice from, to height (excluding to)
     * @default `null`
     * @example `[2, 4]`
     */
    height?: Parameters<Traits["slice"]["height"]["validate"]>[0];
    /**
     * Slice from, to depth (excluding to)
     * @default `null`
     * @example `[2, 4]`
     */
    depth?: Parameters<Traits["slice"]["depth"]["validate"]>[0];
}
interface GetTraitsLerp {
    size: ReturnType<Traits["lerp"]["size"]["validate"]>;
    items: ReturnType<Traits["lerp"]["items"]["validate"]>;
    width: ReturnType<Traits["lerp"]["width"]["validate"]>;
    height: ReturnType<Traits["lerp"]["height"]["validate"]>;
    depth: ReturnType<Traits["lerp"]["depth"]["validate"]>;
}
interface SetTraitsLerp {
    /**
     * Scaling mode (relative, absolute)
     * @default `"absolute"`
     */
    size?: Parameters<Traits["lerp"]["size"]["validate"]>[0];
    /**
     * Lerp to items
     * @default `null`
     * @example `5`
     */
    items?: Parameters<Traits["lerp"]["items"]["validate"]>[0];
    /**
     * Lerp to width
     * @default `null`
     * @example `5`
     */
    width?: Parameters<Traits["lerp"]["width"]["validate"]>[0];
    /**
     * Lerp to height
     * @default `null`
     * @example `5`
     */
    height?: Parameters<Traits["lerp"]["height"]["validate"]>[0];
    /**
     * Lerp to depth
     * @default `null`
     * @example `5`
     */
    depth?: Parameters<Traits["lerp"]["depth"]["validate"]>[0];
}
interface GetTraitsSubdivide {
    items: ReturnType<Traits["subdivide"]["items"]["validate"]>;
    width: ReturnType<Traits["subdivide"]["width"]["validate"]>;
    height: ReturnType<Traits["subdivide"]["height"]["validate"]>;
    depth: ReturnType<Traits["subdivide"]["depth"]["validate"]>;
    bevel: ReturnType<Traits["subdivide"]["bevel"]["validate"]>;
    lerp: ReturnType<Traits["subdivide"]["lerp"]["validate"]>;
}
interface SetTraitsSubdivide {
    /**
     * Divisions of items
     * @default `null`
     * @example `5`
     */
    items?: Parameters<Traits["subdivide"]["items"]["validate"]>[0];
    /**
     * Divisions of width
     * @default `null`
     * @example `5`
     */
    width?: Parameters<Traits["subdivide"]["width"]["validate"]>[0];
    /**
     * Divisions of height
     * @default `null`
     * @example `5`
     */
    height?: Parameters<Traits["subdivide"]["height"]["validate"]>[0];
    /**
     * Divisions of depth
     * @default `null`
     * @example `5`
     */
    depth?: Parameters<Traits["subdivide"]["depth"]["validate"]>[0];
    /**
     * Fraction to end outward from vertices
     * @default `1`
     */
    bevel?: Parameters<Traits["subdivide"]["bevel"]["validate"]>[0];
    /**
     * Interpolate values with computed indices
     * @default `true`
     */
    lerp?: Parameters<Traits["subdivide"]["lerp"]["validate"]>[0];
}
interface GetTraitsResample {
    indices: ReturnType<Traits["resample"]["indices"]["validate"]>;
    channels: ReturnType<Traits["resample"]["channels"]["validate"]>;
    sample: ReturnType<Traits["resample"]["sample"]["validate"]>;
    size: ReturnType<Traits["resample"]["size"]["validate"]>;
    items: ReturnType<Traits["resample"]["items"]["validate"]>;
    width: ReturnType<Traits["resample"]["width"]["validate"]>;
    height: ReturnType<Traits["resample"]["height"]["validate"]>;
    depth: ReturnType<Traits["resample"]["depth"]["validate"]>;
}
interface SetTraitsResample {
    /**
     * Resample indices
     * @default `4`
     */
    indices?: Parameters<Traits["resample"]["indices"]["validate"]>[0];
    /**
     * Resample channels
     * @default `4`
     */
    channels?: Parameters<Traits["resample"]["channels"]["validate"]>[0];
    /**
     * Source sampling (relative, absolute)
     * @default `"relative"`
     */
    sample?: Parameters<Traits["resample"]["sample"]["validate"]>[0];
    /**
     * Scaling mode (relative, absolute)
     * @default `"absolute"`
     */
    size?: Parameters<Traits["resample"]["size"]["validate"]>[0];
    /**
     * Resample factor items
     * @default `null`
     * @example `10`
     */
    items?: Parameters<Traits["resample"]["items"]["validate"]>[0];
    /**
     * Resample factor width
     * @default `null`
     * @example `10`
     */
    width?: Parameters<Traits["resample"]["width"]["validate"]>[0];
    /**
     * Resample factor height
     * @default `null`
     * @example `10`
     */
    height?: Parameters<Traits["resample"]["height"]["validate"]>[0];
    /**
     * Resample factor depth
     * @default `null`
     * @example `10`
     */
    depth?: Parameters<Traits["resample"]["depth"]["validate"]>[0];
}
interface GetTraitsReadback {
    type: ReturnType<Traits["readback"]["type"]["validate"]>;
    expr: ReturnType<Traits["readback"]["expr"]["validate"]>;
    data: ReturnType<Traits["readback"]["data"]["validate"]>;
    channels: ReturnType<Traits["readback"]["channels"]["validate"]>;
    items: ReturnType<Traits["readback"]["items"]["validate"]>;
    width: ReturnType<Traits["readback"]["width"]["validate"]>;
    height: ReturnType<Traits["readback"]["height"]["validate"]>;
    depth: ReturnType<Traits["readback"]["depth"]["validate"]>;
}
interface SetTraitsReadback {
    /**
     * Readback data type (float, unsignedByte)
     * @default `"float"`
     */
    type?: Parameters<Traits["readback"]["type"]["validate"]>[0];
    /**
     * Readback consume expression
     * @default `null`
     */
    expr?: Parameters<Traits["readback"]["expr"]["validate"]>[0];
    /**
     * Readback data buffer (read only)
     * @default `[]`
     */
    data?: Parameters<Traits["readback"]["data"]["validate"]>[0];
    /**
     * Readback channels (read only)
     * @default `4`
     */
    channels?: Parameters<Traits["readback"]["channels"]["validate"]>[0];
    /**
     * Readback items (read only)
     * @default `1`
     */
    items?: Parameters<Traits["readback"]["items"]["validate"]>[0];
    /**
     * Readback width (read only)
     * @default `1`
     */
    width?: Parameters<Traits["readback"]["width"]["validate"]>[0];
    /**
     * Readback height (read only)
     * @default `1`
     */
    height?: Parameters<Traits["readback"]["height"]["validate"]>[0];
    /**
     * Readback depth (read only)
     * @default `1`
     */
    depth?: Parameters<Traits["readback"]["depth"]["validate"]>[0];
}
interface GetTraitsRoot {
    speed: ReturnType<Traits["root"]["speed"]["validate"]>;
    camera: ReturnType<Traits["root"]["camera"]["validate"]>;
}
interface SetTraitsRoot {
    /**
     * Global speed
     * @default `1`
     */
    speed?: Parameters<Traits["root"]["speed"]["validate"]>[0];
    /**
     * Active camera
     * @default `"[camera]"`
     */
    camera?: Parameters<Traits["root"]["camera"]["validate"]>[0];
}
interface GetTraitsRtt {
    size: ReturnType<Traits["rtt"]["size"]["validate"]>;
    width: ReturnType<Traits["rtt"]["width"]["validate"]>;
    height: ReturnType<Traits["rtt"]["height"]["validate"]>;
    history: ReturnType<Traits["rtt"]["history"]["validate"]>;
}
interface SetTraitsRtt {
    /**
     *
     */
    size?: Parameters<Traits["rtt"]["size"]["validate"]>[0];
    /**
     * RTT width
     * @default `null`
     * @example `640`
     */
    width?: Parameters<Traits["rtt"]["width"]["validate"]>[0];
    /**
     * RTT height
     * @default `null`
     * @example `360`
     */
    height?: Parameters<Traits["rtt"]["height"]["validate"]>[0];
    /**
     * RTT history
     * @default `1`
     */
    history?: Parameters<Traits["rtt"]["history"]["validate"]>[0];
}
interface GetTraitsCompose {
    alpha: ReturnType<Traits["compose"]["alpha"]["validate"]>;
}
interface SetTraitsCompose {
    /**
     * Compose with alpha transparency
     * @default `false`
     */
    alpha?: Parameters<Traits["compose"]["alpha"]["validate"]>[0];
}
interface GetTraitsPresent {
    index: ReturnType<Traits["present"]["index"]["validate"]>;
    directed: ReturnType<Traits["present"]["directed"]["validate"]>;
    length: ReturnType<Traits["present"]["length"]["validate"]>;
}
interface SetTraitsPresent {
    /**
     * Present slide number
     * @default `1`
     */
    index?: Parameters<Traits["present"]["index"]["validate"]>[0];
    /**
     * Apply directional transitions
     * @default `true`
     */
    directed?: Parameters<Traits["present"]["directed"]["validate"]>[0];
    /**
     * Presentation length (computed)
     * @default `0`
     */
    length?: Parameters<Traits["present"]["length"]["validate"]>[0];
}
interface GetTraitsSlide {
    order: ReturnType<Traits["slide"]["order"]["validate"]>;
    steps: ReturnType<Traits["slide"]["steps"]["validate"]>;
    early: ReturnType<Traits["slide"]["early"]["validate"]>;
    late: ReturnType<Traits["slide"]["late"]["validate"]>;
    from: ReturnType<Traits["slide"]["from"]["validate"]>;
    to: ReturnType<Traits["slide"]["to"]["validate"]>;
}
interface SetTraitsSlide {
    /**
     * Slide order
     * @default `0`
     */
    order?: Parameters<Traits["slide"]["order"]["validate"]>[0];
    /**
     * Slide steps
     * @default `1`
     */
    steps?: Parameters<Traits["slide"]["steps"]["validate"]>[0];
    /**
     * Appear early steps
     * @default `0`
     */
    early?: Parameters<Traits["slide"]["early"]["validate"]>[0];
    /**
     * Stay late steps
     * @default `0`
     */
    late?: Parameters<Traits["slide"]["late"]["validate"]>[0];
    /**
     * Appear from step
     * @default `null`
     * @example `2`
     */
    from?: Parameters<Traits["slide"]["from"]["validate"]>[0];
    /**
     * Disappear on step
     * @default `null`
     * @example `4`
     */
    to?: Parameters<Traits["slide"]["to"]["validate"]>[0];
}
interface GetTraitsTransition {
    stagger: ReturnType<Traits["transition"]["stagger"]["validate"]>;
    enter: ReturnType<Traits["transition"]["enter"]["validate"]>;
    exit: ReturnType<Traits["transition"]["exit"]["validate"]>;
    delay: ReturnType<Traits["transition"]["delay"]["validate"]>;
    delayEnter: ReturnType<Traits["transition"]["delayEnter"]["validate"]>;
    delayExit: ReturnType<Traits["transition"]["delayExit"]["validate"]>;
    duration: ReturnType<Traits["transition"]["duration"]["validate"]>;
    durationEnter: ReturnType<Traits["transition"]["durationEnter"]["validate"]>;
    durationExit: ReturnType<Traits["transition"]["durationExit"]["validate"]>;
}
interface SetTraitsTransition {
    /**
     * Stagger dimensions
     * @default `[0, 0, 0, 0]`
     * @example `[2, 1, 0, 0]`
     */
    stagger?: Parameters<Traits["transition"]["stagger"]["validate"]>[0];
    /**
     * Enter state
     * @default `null`
     * @example `0.5`
     */
    enter?: Parameters<Traits["transition"]["enter"]["validate"]>[0];
    /**
     * Exit state
     * @default `null`
     * @example `0.5`
     */
    exit?: Parameters<Traits["transition"]["exit"]["validate"]>[0];
    /**
     * Transition delay
     * @default `0`
     */
    delay?: Parameters<Traits["transition"]["delay"]["validate"]>[0];
    /**
     * Transition enter delay
     * @default `null`
     * @example `0.3`
     */
    delayEnter?: Parameters<Traits["transition"]["delayEnter"]["validate"]>[0];
    /**
     * Transition exit delay
     * @default `null`
     * @example `0.3`
     */
    delayExit?: Parameters<Traits["transition"]["delayExit"]["validate"]>[0];
    /**
     * Transition duration
     * @default `0.3`
     */
    duration?: Parameters<Traits["transition"]["duration"]["validate"]>[0];
    /**
     * Transition enter duration
     * @default `0.3`
     */
    durationEnter?: Parameters<Traits["transition"]["durationEnter"]["validate"]>[0];
    /**
     * Transition exit duration
     * @default `0.3`
     */
    durationExit?: Parameters<Traits["transition"]["durationExit"]["validate"]>[0];
}
interface GetTraitsMove {
    from: ReturnType<Traits["move"]["from"]["validate"]>;
    to: ReturnType<Traits["move"]["to"]["validate"]>;
}
interface SetTraitsMove {
    /**
     * Enter from
     * @default `[0, 0, 0, 0]`
     */
    from?: Parameters<Traits["move"]["from"]["validate"]>[0];
    /**
     * Exit to
     * @default `[0, 0, 0, 0]`
     */
    to?: Parameters<Traits["move"]["to"]["validate"]>[0];
}
interface GetTraitsSeek {
    seek: ReturnType<Traits["seek"]["seek"]["validate"]>;
}
interface SetTraitsSeek {
    /**
     * Seek to time
     * @default `null`
     * @example `4`
     */
    seek?: Parameters<Traits["seek"]["seek"]["validate"]>[0];
}
interface GetTraitsTrack {
    target: ReturnType<Traits["track"]["target"]["validate"]>;
    script: ReturnType<Traits["track"]["script"]["validate"]>;
    ease: ReturnType<Traits["track"]["ease"]["validate"]>;
}
interface SetTraitsTrack {
    /**
     * Animation target
     * @default `"<"`
     */
    target?: Parameters<Traits["track"]["target"]["validate"]>[0];
    /**
     * Animation script
     * @default `{}`
     * @example `{ "0": { props: { color: "red" }, expr: { size: function (t) { return Math.sin(t) + 1; }}}, "1": ...}`
     */
    script?: Parameters<Traits["track"]["script"]["validate"]>[0];
    /**
     * Animation ease (linear, cosine, binary, hold)
     * @default `"cosine"`
     */
    ease?: Parameters<Traits["track"]["ease"]["validate"]>[0];
}
interface GetTraitsTrigger {
    trigger: ReturnType<Traits["trigger"]["trigger"]["validate"]>;
}
interface SetTraitsTrigger {
    /**
     * Trigger on step
     * @default `1`
     */
    trigger?: Parameters<Traits["trigger"]["trigger"]["validate"]>[0];
}
interface GetTraitsStep {
    playback: ReturnType<Traits["step"]["playback"]["validate"]>;
    stops: ReturnType<Traits["step"]["stops"]["validate"]>;
    delay: ReturnType<Traits["step"]["delay"]["validate"]>;
    duration: ReturnType<Traits["step"]["duration"]["validate"]>;
    pace: ReturnType<Traits["step"]["pace"]["validate"]>;
    speed: ReturnType<Traits["step"]["speed"]["validate"]>;
    rewind: ReturnType<Traits["step"]["rewind"]["validate"]>;
    skip: ReturnType<Traits["step"]["skip"]["validate"]>;
    realtime: ReturnType<Traits["step"]["realtime"]["validate"]>;
}
interface SetTraitsStep {
    /**
     * Playhead ease (linear, cosine, binary, hold)
     * @default `"linear"`
     */
    playback?: Parameters<Traits["step"]["playback"]["validate"]>[0];
    /**
     * Playhead stops
     * @default `null`
     * @example `[0, 1, 3, 5]`
     */
    stops?: Parameters<Traits["step"]["stops"]["validate"]>[0];
    /**
     * Step delay
     * @default `0`
     */
    delay?: Parameters<Traits["step"]["delay"]["validate"]>[0];
    /**
     * Step duration
     * @default `0.3`
     */
    duration?: Parameters<Traits["step"]["duration"]["validate"]>[0];
    /**
     * Step pace
     * @default `0`
     */
    pace?: Parameters<Traits["step"]["pace"]["validate"]>[0];
    /**
     * Step speed
     * @default `1`
     */
    speed?: Parameters<Traits["step"]["speed"]["validate"]>[0];
    /**
     * Step rewind factor
     * @default `2`
     */
    rewind?: Parameters<Traits["step"]["rewind"]["validate"]>[0];
    /**
     * Speed up through skips
     * @default `true`
     */
    skip?: Parameters<Traits["step"]["skip"]["validate"]>[0];
    /**
     * Run on real time, not clock time
     * @default `false`
     */
    realtime?: Parameters<Traits["step"]["realtime"]["validate"]>[0];
}
interface GetTraitsPlay {
    delay: ReturnType<Traits["play"]["delay"]["validate"]>;
    pace: ReturnType<Traits["play"]["pace"]["validate"]>;
    speed: ReturnType<Traits["play"]["speed"]["validate"]>;
    from: ReturnType<Traits["play"]["from"]["validate"]>;
    to: ReturnType<Traits["play"]["to"]["validate"]>;
    realtime: ReturnType<Traits["play"]["realtime"]["validate"]>;
    loop: ReturnType<Traits["play"]["loop"]["validate"]>;
}
interface SetTraitsPlay {
    /**
     * Play delay
     * @default `0`
     */
    delay?: Parameters<Traits["play"]["delay"]["validate"]>[0];
    /**
     * Play pace
     * @default `1`
     */
    pace?: Parameters<Traits["play"]["pace"]["validate"]>[0];
    /**
     * Play speed
     * @default `1`
     */
    speed?: Parameters<Traits["play"]["speed"]["validate"]>[0];
    /**
     * Play from
     * @default `0`
     */
    from?: Parameters<Traits["play"]["from"]["validate"]>[0];
    /**
     * Play until
     * @default `Infinity`
     */
    to?: Parameters<Traits["play"]["to"]["validate"]>[0];
    /**
     * Run on real time, not clock time
     * @default `false`
     */
    realtime?: Parameters<Traits["play"]["realtime"]["validate"]>[0];
    /**
     * Loop
     * @default `false`
     */
    loop?: Parameters<Traits["play"]["loop"]["validate"]>[0];
}
interface GetTraitsNow {
    now: ReturnType<Traits["now"]["now"]["validate"]>;
    seek: ReturnType<Traits["now"]["seek"]["validate"]>;
    pace: ReturnType<Traits["now"]["pace"]["validate"]>;
    speed: ReturnType<Traits["now"]["speed"]["validate"]>;
}
interface SetTraitsNow {
    /**
     * Current moment
     * @default `null`
     * @example `1444094929.619`
     */
    now?: Parameters<Traits["now"]["now"]["validate"]>[0];
    /**
     * Seek to time
     * @default `null`
     */
    seek?: Parameters<Traits["now"]["seek"]["validate"]>[0];
    /**
     * Time pace
     * @default `1`
     */
    pace?: Parameters<Traits["now"]["pace"]["validate"]>[0];
    /**
     * Time speed
     * @default `1`
     */
    speed?: Parameters<Traits["now"]["speed"]["validate"]>[0];
}
/**
 * Normalized properties for {@link MathboxSelection.area | area}.
 * @category data
 */
export interface AreaPropsNormalized extends GetTraitsNode, GetTraitsBuffer, GetTraitsData, GetTraitsMatrix, GetTraitsTexture, GetTraitsArea {
    expr: AreaEmitter | null;
}
/**
 * Properties for {@link MathboxSelection.area | area}.
 * @category data
 */
export interface AreaProps extends SetTraitsNode, SetTraitsBuffer, SetTraitsData, SetTraitsMatrix, SetTraitsTexture, SetTraitsArea {
    expr?: AreaEmitter;
}
/**
 * Normalized properties for {@link MathboxSelection.array | array}.
 * @category data
 */
export interface ArrayPropsNormalized extends GetTraitsNode, GetTraitsBuffer, GetTraitsData, GetTraitsArray, GetTraitsTexture {
    expr: ArrayEmitter | null;
}
/**
 * Properties for {@link MathboxSelection.array | array}.
 * @category data
 */
export interface ArrayProps extends SetTraitsNode, SetTraitsBuffer, SetTraitsData, SetTraitsArray, SetTraitsTexture {
    expr?: ArrayEmitter;
}
/**
 * Normalized properties for {@link MathboxSelection.axis | axis}.
 * @category draw
 */
export interface AxisPropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsStyle, GetTraitsLine, GetTraitsAxis, GetTraitsSpan, GetTraitsInterval, GetTraitsArrow, GetTraitsOrigin {
}
/**
 * Properties for {@link MathboxSelection.axis | axis}.
 * @category draw
 */
export interface AxisProps extends SetTraitsNode, SetTraitsObject, SetTraitsStyle, SetTraitsLine, SetTraitsAxis, SetTraitsSpan, SetTraitsInterval, SetTraitsArrow, SetTraitsOrigin {
}
/**
 * Normalized properties for {@link MathboxSelection.camera | camera}.
 * @category camera
 */
export interface CameraPropsNormalized extends GetTraitsNode, GetTraitsCamera {
}
/**
 * Properties for {@link MathboxSelection.camera | camera}.
 * @category camera
 */
export interface CameraProps extends SetTraitsNode, SetTraitsCamera {
}
/**
 * Normalized properties for {@link MathboxSelection.cartesian | cartesian}.
 * @category view
 */
export interface CartesianPropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsView, GetTraitsView3, GetTraitsVertex {
}
/**
 * Properties for {@link MathboxSelection.cartesian | cartesian}.
 * @category view
 */
export interface CartesianProps extends SetTraitsNode, SetTraitsObject, SetTraitsView, SetTraitsView3, SetTraitsVertex {
}
/**
 * Normalized properties for {@link MathboxSelection.cartesian4 | cartesian4}.
 * @category view
 */
export interface Cartesian4PropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsView, GetTraitsView4, GetTraitsVertex {
}
/**
 * Properties for {@link MathboxSelection.cartesian4 | cartesian4}.
 * @category view
 */
export interface Cartesian4Props extends SetTraitsNode, SetTraitsObject, SetTraitsView, SetTraitsView4, SetTraitsVertex {
}
/**
 * Normalized properties for {@link MathboxSelection.clamp | clamp}.
 * @category operator
 */
export interface ClampPropsNormalized extends GetTraitsNode, GetTraitsOperator {
}
/**
 * Properties for {@link MathboxSelection.clamp | clamp}.
 * @category operator
 */
export interface ClampProps extends SetTraitsNode, SetTraitsOperator {
}
/**
 * Normalized properties for {@link MathboxSelection.clock | clock}.
 * @category time
 */
export interface ClockPropsNormalized extends GetTraitsNode, GetTraitsSeek, GetTraitsPlay {
}
/**
 * Properties for {@link MathboxSelection.clock | clock}.
 * @category time
 */
export interface ClockProps extends SetTraitsNode, SetTraitsSeek, SetTraitsPlay {
}
/**
 * Normalized properties for {@link MathboxSelection.compose | compose}.
 * @category rtt
 */
export interface ComposePropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsOperator, GetTraitsStyle, GetTraitsCompose {
}
/**
 * Properties for {@link MathboxSelection.compose | compose}.
 * @category rtt
 */
export interface ComposeProps extends SetTraitsNode, SetTraitsObject, SetTraitsOperator, SetTraitsStyle, SetTraitsCompose {
}
/**
 * Normalized properties for {@link MathboxSelection.dom | dom}.
 * @category overlay
 */
export interface DomPropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsOverlay, GetTraitsDom, GetTraitsAttach {
}
/**
 * Properties for {@link MathboxSelection.dom | dom}.
 * @category overlay
 */
export interface DomProps extends SetTraitsNode, SetTraitsObject, SetTraitsOverlay, SetTraitsDom, SetTraitsAttach {
}
/**
 * Normalized properties for {@link MathboxSelection.face | face}.
 * @category draw
 */
export interface FacePropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsStyle, GetTraitsLine, GetTraitsMesh, GetTraitsFace, GetTraitsGeometry {
}
/**
 * Properties for {@link MathboxSelection.face | face}.
 * @category draw
 */
export interface FaceProps extends SetTraitsNode, SetTraitsObject, SetTraitsStyle, SetTraitsLine, SetTraitsMesh, SetTraitsFace, SetTraitsGeometry {
}
/**
 * Normalized properties for {@link MathboxSelection.format | format}.
 * @category text
 */
export interface FormatPropsNormalized extends GetTraitsNode, GetTraitsOperator, GetTraitsTexture, GetTraitsFormat, GetTraitsFont {
}
/**
 * Properties for {@link MathboxSelection.format | format}.
 * @category text
 */
export interface FormatProps extends SetTraitsNode, SetTraitsOperator, SetTraitsTexture, SetTraitsFormat, SetTraitsFont {
}
/**
 * Normalized properties for {@link MathboxSelection.fragment | fragment}.
 * @category transform
 */
export interface FragmentPropsNormalized extends GetTraitsNode, GetTraitsInclude, GetTraitsFragment {
}
/**
 * Properties for {@link MathboxSelection.fragment | fragment}.
 * @category transform
 */
export interface FragmentProps extends SetTraitsNode, SetTraitsInclude, SetTraitsFragment {
}
/**
 * Normalized properties for {@link MathboxSelection.grid | grid}.
 * @category draw
 */
export interface GridPropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsStyle, GetTraitsLine, GetTraitsGrid, GetTraitsArea, GetTraitsOrigin {
}
/**
 * Properties for {@link MathboxSelection.grid | grid}.
 * @category draw
 */
export interface GridProps extends SetTraitsNode, SetTraitsObject, SetTraitsStyle, SetTraitsLine, SetTraitsGrid, SetTraitsArea, SetTraitsOrigin {
}
/**
 * Normalized properties for {@link MathboxSelection.group | group}.
 * @category base
 */
export interface GroupPropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsEntity {
}
/**
 * Properties for {@link MathboxSelection.group | group}.
 * @category base
 */
export interface GroupProps extends SetTraitsNode, SetTraitsObject, SetTraitsEntity {
}
/**
 * Normalized properties for {@link MathboxSelection.grow | grow}.
 * @category operator
 */
export interface GrowPropsNormalized extends GetTraitsNode, GetTraitsOperator, GetTraitsGrow {
}
/**
 * Properties for {@link MathboxSelection.grow | grow}.
 * @category operator
 */
export interface GrowProps extends SetTraitsNode, SetTraitsOperator, SetTraitsGrow {
}
/**
 * Normalized properties for {@link MathboxSelection.html | html}.
 * @category overlay
 */
export interface HtmlPropsNormalized extends GetTraitsNode, GetTraitsBuffer, GetTraitsData, GetTraitsVoxel {
}
/**
 * Properties for {@link MathboxSelection.html | html}.
 * @category overlay
 */
export interface HtmlProps extends SetTraitsNode, SetTraitsBuffer, SetTraitsData, SetTraitsVoxel {
}
/**
 * Normalized properties for {@link MathboxSelection.inherit | inherit}.
 * @category base
 */
export declare type InheritPropsNormalized = GetTraitsNode;
/**
 * Properties for {@link MathboxSelection.inherit | inherit}.
 * @category base
 */
export declare type InheritProps = SetTraitsNode;
/**
 * Normalized properties for {@link MathboxSelection.interval | interval}.
 * @category data
 */
export interface IntervalPropsNormalized extends GetTraitsNode, GetTraitsBuffer, GetTraitsData, GetTraitsTexture, GetTraitsArray, GetTraitsSpan, GetTraitsInterval, GetTraitsSampler {
    expr: IntervalEmitter | null;
}
/**
 * Properties for {@link MathboxSelection.interval | interval}.
 * @category data
 */
export interface IntervalProps extends SetTraitsNode, SetTraitsBuffer, SetTraitsData, SetTraitsTexture, SetTraitsArray, SetTraitsSpan, SetTraitsInterval, SetTraitsSampler {
    expr?: IntervalEmitter;
}
/**
 * Normalized properties for {@link MathboxSelection.join | join}.
 * @category operator
 */
export interface JoinPropsNormalized extends GetTraitsNode, GetTraitsOperator, GetTraitsJoin {
}
/**
 * Properties for {@link MathboxSelection.join | join}.
 * @category operator
 */
export interface JoinProps extends SetTraitsNode, SetTraitsOperator, SetTraitsJoin {
}
/**
 * Normalized properties for {@link MathboxSelection.label | label}.
 * @category text
 */
export interface LabelPropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsStyle, GetTraitsLabel, GetTraitsAttach, GetTraitsGeometry {
}
/**
 * Properties for {@link MathboxSelection.label | label}.
 * @category text
 */
export interface LabelProps extends SetTraitsNode, SetTraitsObject, SetTraitsStyle, SetTraitsLabel, SetTraitsAttach, SetTraitsGeometry {
}
/**
 * Normalized properties for {@link MathboxSelection.layer | layer}.
 * @category transform
 */
export interface LayerPropsNormalized extends GetTraitsNode, GetTraitsVertex, GetTraitsLayer {
}
/**
 * Properties for {@link MathboxSelection.layer | layer}.
 * @category transform
 */
export interface LayerProps extends SetTraitsNode, SetTraitsVertex, SetTraitsLayer {
}
/**
 * Normalized properties for {@link MathboxSelection.lerp | lerp}.
 * @category operator
 */
export interface LerpPropsNormalized extends GetTraitsNode, GetTraitsOperator, GetTraitsLerp {
}
/**
 * Properties for {@link MathboxSelection.lerp | lerp}.
 * @category operator
 */
export interface LerpProps extends SetTraitsNode, SetTraitsOperator, SetTraitsLerp {
}
/**
 * Normalized properties for {@link MathboxSelection.line | line}.
 * @category draw
 */
export interface LinePropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsStyle, GetTraitsLine, GetTraitsArrow, GetTraitsGeometry {
}
/**
 * Properties for {@link MathboxSelection.line | line}.
 * @category draw
 */
export interface LineProps extends SetTraitsNode, SetTraitsObject, SetTraitsStyle, SetTraitsLine, SetTraitsArrow, SetTraitsGeometry {
}
/**
 * Normalized properties for {@link MathboxSelection.mask | mask}.
 * @category transform
 */
export interface MaskPropsNormalized extends GetTraitsNode, GetTraitsInclude {
}
/**
 * Properties for {@link MathboxSelection.mask | mask}.
 * @category transform
 */
export interface MaskProps extends SetTraitsNode, SetTraitsInclude {
}
/**
 * Normalized properties for {@link MathboxSelection.matrix | matrix}.
 * @category data
 */
export interface MatrixPropsNormalized extends GetTraitsNode, GetTraitsBuffer, GetTraitsData, GetTraitsTexture, GetTraitsMatrix {
    expr: MatrixEmitter | null;
}
/**
 * Properties for {@link MathboxSelection.matrix | matrix}.
 * @category data
 */
export interface MatrixProps extends SetTraitsNode, SetTraitsBuffer, SetTraitsData, SetTraitsTexture, SetTraitsMatrix {
    expr?: MatrixEmitter;
}
/**
 * Normalized properties for {@link MathboxSelection.memo | memo}.
 * @category operator
 */
export interface MemoPropsNormalized extends GetTraitsNode, GetTraitsOperator, GetTraitsTexture {
}
/**
 * Properties for {@link MathboxSelection.memo | memo}.
 * @category operator
 */
export interface MemoProps extends SetTraitsNode, SetTraitsOperator, SetTraitsTexture {
}
/**
 * Normalized properties for {@link MathboxSelection.move | move}.
 * @category present
 */
export interface MovePropsNormalized extends GetTraitsNode, GetTraitsTransition, GetTraitsVertex, GetTraitsMove {
}
/**
 * Properties for {@link MathboxSelection.move | move}.
 * @category present
 */
export interface MoveProps extends SetTraitsNode, SetTraitsTransition, SetTraitsVertex, SetTraitsMove {
}
/**
 * Normalized properties for {@link MathboxSelection.now | now}.
 * @category time
 */
export interface NowPropsNormalized extends GetTraitsNode, GetTraitsNow {
}
/**
 * Properties for {@link MathboxSelection.now | now}.
 * @category time
 */
export interface NowProps extends SetTraitsNode, SetTraitsNow {
}
/**
 * Normalized properties for {@link MathboxSelection.play | play}.
 * @category present
 */
export interface PlayPropsNormalized extends GetTraitsNode, GetTraitsTrack, GetTraitsTrigger, GetTraitsPlay {
}
/**
 * Properties for {@link MathboxSelection.play | play}.
 * @category present
 */
export interface PlayProps extends SetTraitsNode, SetTraitsTrack, SetTraitsTrigger, SetTraitsPlay {
}
/**
 * Normalized properties for {@link MathboxSelection.point | point}.
 * @category draw
 */
export interface PointPropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsStyle, GetTraitsPoint, GetTraitsGeometry {
}
/**
 * Properties for {@link MathboxSelection.point | point}.
 * @category draw
 */
export interface PointProps extends SetTraitsNode, SetTraitsObject, SetTraitsStyle, SetTraitsPoint, SetTraitsGeometry {
}
/**
 * Normalized properties for {@link MathboxSelection.polar | polar}.
 * @category view
 */
export interface PolarPropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsView, GetTraitsView3, GetTraitsPolar, GetTraitsVertex {
}
/**
 * Properties for {@link MathboxSelection.polar | polar}.
 * @category view
 */
export interface PolarProps extends SetTraitsNode, SetTraitsObject, SetTraitsView, SetTraitsView3, SetTraitsPolar, SetTraitsVertex {
}
/**
 * Normalized properties for {@link MathboxSelection.present | present}.
 * @category present
 */
export interface PresentPropsNormalized extends GetTraitsNode, GetTraitsPresent {
}
/**
 * Properties for {@link MathboxSelection.present | present}.
 * @category present
 */
export interface PresentProps extends SetTraitsNode, SetTraitsPresent {
}
/**
 * Normalized properties for {@link MathboxSelection.readback | readback}.
 * @category operator
 */
export interface ReadbackPropsNormalized extends GetTraitsNode, GetTraitsOperator, GetTraitsReadback, GetTraitsEntity {
}
/**
 * Properties for {@link MathboxSelection.readback | readback}.
 * @category operator
 */
export interface ReadbackProps extends SetTraitsNode, SetTraitsOperator, SetTraitsReadback, SetTraitsEntity {
}
/**
 * Normalized properties for {@link MathboxSelection.repeat | repeat}.
 * @category operator
 */
export interface RepeatPropsNormalized extends GetTraitsNode, GetTraitsOperator, GetTraitsRepeat {
}
/**
 * Properties for {@link MathboxSelection.repeat | repeat}.
 * @category operator
 */
export interface RepeatProps extends SetTraitsNode, SetTraitsOperator, SetTraitsRepeat {
}
/**
 * Normalized properties for {@link MathboxSelection.resample | resample}.
 * @category operator
 */
export interface ResamplePropsNormalized extends GetTraitsNode, GetTraitsOperator, GetTraitsResample, GetTraitsInclude {
}
/**
 * Properties for {@link MathboxSelection.resample | resample}.
 * @category operator
 */
export interface ResampleProps extends SetTraitsNode, SetTraitsOperator, SetTraitsResample, SetTraitsInclude {
}
/**
 * Normalized properties for {@link MathboxSelection.retext | retext}.
 * @category text
 */
export interface RetextPropsNormalized extends GetTraitsNode, GetTraitsOperator, GetTraitsResample, GetTraitsInclude {
}
/**
 * Properties for {@link MathboxSelection.retext | retext}.
 * @category text
 */
export interface RetextProps extends SetTraitsNode, SetTraitsOperator, SetTraitsResample, SetTraitsInclude {
}
/**
 * Normalized properties for {@link MathboxSelection.reveal | reveal}.
 * @category present
 */
export interface RevealPropsNormalized extends GetTraitsNode, GetTraitsTransition {
}
/**
 * Properties for {@link MathboxSelection.reveal | reveal}.
 * @category present
 */
export interface RevealProps extends SetTraitsNode, SetTraitsTransition {
}
/**
 * Normalized properties for {@link MathboxSelection.root | root}.
 * @category base
 */
export interface RootPropsNormalized extends GetTraitsNode, GetTraitsRoot, GetTraitsVertex, GetTraitsUnit {
}
/**
 * Properties for {@link MathboxSelection.root | root}.
 * @category base
 */
export interface RootProps extends SetTraitsNode, SetTraitsRoot, SetTraitsVertex, SetTraitsUnit {
}
/**
 * Normalized properties for {@link MathboxSelection.rtt | rtt}.
 * @category rtt
 */
export interface RttPropsNormalized extends GetTraitsNode, GetTraitsRoot, GetTraitsVertex, GetTraitsTexture, GetTraitsRtt {
}
/**
 * Properties for {@link MathboxSelection.rtt | rtt}.
 * @category rtt
 */
export interface RttProps extends SetTraitsNode, SetTraitsRoot, SetTraitsVertex, SetTraitsTexture, SetTraitsRtt {
}
/**
 * Normalized properties for {@link MathboxSelection.scale | scale}.
 * @category data
 */
export interface ScalePropsNormalized extends GetTraitsNode, GetTraitsInterval, GetTraitsSpan, GetTraitsScale, GetTraitsOrigin {
}
/**
 * Properties for {@link MathboxSelection.scale | scale}.
 * @category data
 */
export interface ScaleProps extends SetTraitsNode, SetTraitsInterval, SetTraitsSpan, SetTraitsScale, SetTraitsOrigin {
}
/**
 * Normalized properties for {@link MathboxSelection.shader | shader}.
 * @category shader
 */
export interface ShaderPropsNormalized extends GetTraitsNode, GetTraitsShader {
}
/**
 * Properties for {@link MathboxSelection.shader | shader}.
 * @category shader
 */
export interface ShaderProps extends SetTraitsNode, SetTraitsShader {
}
/**
 * Normalized properties for {@link MathboxSelection.slice | slice}.
 * @category operator
 */
export interface SlicePropsNormalized extends GetTraitsNode, GetTraitsOperator, GetTraitsSlice {
}
/**
 * Properties for {@link MathboxSelection.slice | slice}.
 * @category operator
 */
export interface SliceProps extends SetTraitsNode, SetTraitsOperator, SetTraitsSlice {
}
/**
 * Normalized properties for {@link MathboxSelection.slide | slide}.
 * @category present
 */
export interface SlidePropsNormalized extends GetTraitsNode, GetTraitsSlide {
}
/**
 * Properties for {@link MathboxSelection.slide | slide}.
 * @category present
 */
export interface SlideProps extends SetTraitsNode, SetTraitsSlide {
}
/**
 * Normalized properties for {@link MathboxSelection.spherical | spherical}.
 * @category view
 */
export interface SphericalPropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsView, GetTraitsView3, GetTraitsSpherical, GetTraitsVertex {
}
/**
 * Properties for {@link MathboxSelection.spherical | spherical}.
 * @category view
 */
export interface SphericalProps extends SetTraitsNode, SetTraitsObject, SetTraitsView, SetTraitsView3, SetTraitsSpherical, SetTraitsVertex {
}
/**
 * Normalized properties for {@link MathboxSelection.split | split}.
 * @category operator
 */
export interface SplitPropsNormalized extends GetTraitsNode, GetTraitsOperator, GetTraitsSplit {
}
/**
 * Properties for {@link MathboxSelection.split | split}.
 * @category operator
 */
export interface SplitProps extends SetTraitsNode, SetTraitsOperator, SetTraitsSplit {
}
/**
 * Normalized properties for {@link MathboxSelection.spread | spread}.
 * @category operator
 */
export interface SpreadPropsNormalized extends GetTraitsNode, GetTraitsOperator, GetTraitsSpread {
}
/**
 * Properties for {@link MathboxSelection.spread | spread}.
 * @category operator
 */
export interface SpreadProps extends SetTraitsNode, SetTraitsOperator, SetTraitsSpread {
}
/**
 * Normalized properties for {@link MathboxSelection.step | step}.
 * @category present
 */
export interface StepPropsNormalized extends GetTraitsNode, GetTraitsTrack, GetTraitsStep, GetTraitsTrigger {
}
/**
 * Properties for {@link MathboxSelection.step | step}.
 * @category present
 */
export interface StepProps extends SetTraitsNode, SetTraitsTrack, SetTraitsStep, SetTraitsTrigger {
}
/**
 * Normalized properties for {@link MathboxSelection.stereographic | stereographic}.
 * @category view
 */
export interface StereographicPropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsView, GetTraitsView3, GetTraitsStereographic, GetTraitsVertex {
}
/**
 * Properties for {@link MathboxSelection.stereographic | stereographic}.
 * @category view
 */
export interface StereographicProps extends SetTraitsNode, SetTraitsObject, SetTraitsView, SetTraitsView3, SetTraitsStereographic, SetTraitsVertex {
}
/**
 * Normalized properties for {@link MathboxSelection.stereographic4 | stereographic4}.
 * @category view
 */
export interface Stereographic4PropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsView, GetTraitsView4, GetTraitsStereographic, GetTraitsVertex {
}
/**
 * Properties for {@link MathboxSelection.stereographic4 | stereographic4}.
 * @category view
 */
export interface Stereographic4Props extends SetTraitsNode, SetTraitsObject, SetTraitsView, SetTraitsView4, SetTraitsStereographic, SetTraitsVertex {
}
/**
 * Normalized properties for {@link MathboxSelection.strip | strip}.
 * @category draw
 */
export interface StripPropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsStyle, GetTraitsLine, GetTraitsMesh, GetTraitsStrip, GetTraitsGeometry {
}
/**
 * Properties for {@link MathboxSelection.strip | strip}.
 * @category draw
 */
export interface StripProps extends SetTraitsNode, SetTraitsObject, SetTraitsStyle, SetTraitsLine, SetTraitsMesh, SetTraitsStrip, SetTraitsGeometry {
}
/**
 * Normalized properties for {@link MathboxSelection.subdivide | subdivide}.
 * @category operator
 */
export interface SubdividePropsNormalized extends GetTraitsNode, GetTraitsOperator, GetTraitsSubdivide {
}
/**
 * Properties for {@link MathboxSelection.subdivide | subdivide}.
 * @category operator
 */
export interface SubdivideProps extends SetTraitsNode, SetTraitsOperator, SetTraitsSubdivide {
}
/**
 * Normalized properties for {@link MathboxSelection.surface | surface}.
 * @category draw
 */
export interface SurfacePropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsStyle, GetTraitsLine, GetTraitsMesh, GetTraitsGeometry, GetTraitsGrid {
}
/**
 * Properties for {@link MathboxSelection.surface | surface}.
 * @category draw
 */
export interface SurfaceProps extends SetTraitsNode, SetTraitsObject, SetTraitsStyle, SetTraitsLine, SetTraitsMesh, SetTraitsGeometry, SetTraitsGrid {
}
/**
 * Normalized properties for {@link MathboxSelection.swizzle | swizzle}.
 * @category operator
 */
export interface SwizzlePropsNormalized extends GetTraitsNode, GetTraitsOperator, GetTraitsSwizzle {
}
/**
 * Properties for {@link MathboxSelection.swizzle | swizzle}.
 * @category operator
 */
export interface SwizzleProps extends SetTraitsNode, SetTraitsOperator, SetTraitsSwizzle {
}
/**
 * Normalized properties for {@link MathboxSelection.text | text}.
 * @category text
 */
export interface TextPropsNormalized extends GetTraitsNode, GetTraitsBuffer, GetTraitsData, GetTraitsTexture, GetTraitsVoxel, GetTraitsFont {
}
/**
 * Properties for {@link MathboxSelection.text | text}.
 * @category text
 */
export interface TextProps extends SetTraitsNode, SetTraitsBuffer, SetTraitsData, SetTraitsTexture, SetTraitsVoxel, SetTraitsFont {
}
/**
 * Normalized properties for {@link MathboxSelection.ticks | ticks}.
 * @category draw
 */
export interface TicksPropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsStyle, GetTraitsLine, GetTraitsTicks, GetTraitsGeometry {
}
/**
 * Properties for {@link MathboxSelection.ticks | ticks}.
 * @category draw
 */
export interface TicksProps extends SetTraitsNode, SetTraitsObject, SetTraitsStyle, SetTraitsLine, SetTraitsTicks, SetTraitsGeometry {
}
/**
 * Normalized properties for {@link MathboxSelection.transform | transform}.
 * @category transform
 */
export interface TransformPropsNormalized extends GetTraitsNode, GetTraitsVertex, GetTraitsTransform3 {
}
/**
 * Properties for {@link MathboxSelection.transform | transform}.
 * @category transform
 */
export interface TransformProps extends SetTraitsNode, SetTraitsVertex, SetTraitsTransform3 {
}
/**
 * Normalized properties for {@link MathboxSelection.transform4 | transform4}.
 * @category transform
 */
export interface Transform4PropsNormalized extends GetTraitsNode, GetTraitsVertex, GetTraitsTransform4 {
}
/**
 * Properties for {@link MathboxSelection.transform4 | transform4}.
 * @category transform
 */
export interface Transform4Props extends SetTraitsNode, SetTraitsVertex, SetTraitsTransform4 {
}
/**
 * Normalized properties for {@link MathboxSelection.transpose | transpose}.
 * @category operator
 */
export interface TransposePropsNormalized extends GetTraitsNode, GetTraitsOperator, GetTraitsTranspose {
}
/**
 * Properties for {@link MathboxSelection.transpose | transpose}.
 * @category operator
 */
export interface TransposeProps extends SetTraitsNode, SetTraitsOperator, SetTraitsTranspose {
}
/**
 * Normalized properties for {@link MathboxSelection.unit | unit}.
 * @category base
 */
export interface UnitPropsNormalized extends GetTraitsNode, GetTraitsUnit {
}
/**
 * Properties for {@link MathboxSelection.unit | unit}.
 * @category base
 */
export interface UnitProps extends SetTraitsNode, SetTraitsUnit {
}
/**
 * Normalized properties for {@link MathboxSelection.vector | vector}.
 * @category draw
 */
export interface VectorPropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsStyle, GetTraitsLine, GetTraitsArrow, GetTraitsGeometry {
}
/**
 * Properties for {@link MathboxSelection.vector | vector}.
 * @category draw
 */
export interface VectorProps extends SetTraitsNode, SetTraitsObject, SetTraitsStyle, SetTraitsLine, SetTraitsArrow, SetTraitsGeometry {
}
/**
 * Normalized properties for {@link MathboxSelection.vertex | vertex}.
 * @category transform
 */
export interface VertexPropsNormalized extends GetTraitsNode, GetTraitsInclude, GetTraitsVertex {
}
/**
 * Properties for {@link MathboxSelection.vertex | vertex}.
 * @category transform
 */
export interface VertexProps extends SetTraitsNode, SetTraitsInclude, SetTraitsVertex {
}
/**
 * Normalized properties for {@link MathboxSelection.view | view}.
 * @category view
 */
export interface ViewPropsNormalized extends GetTraitsNode, GetTraitsObject, GetTraitsView, GetTraitsVertex {
}
/**
 * Properties for {@link MathboxSelection.view | view}.
 * @category view
 */
export interface ViewProps extends SetTraitsNode, SetTraitsObject, SetTraitsView, SetTraitsVertex {
}
/**
 * Normalized properties for {@link MathboxSelection.volume | volume}.
 * @category data
 */
export interface VolumePropsNormalized extends GetTraitsNode, GetTraitsBuffer, GetTraitsData, GetTraitsTexture, GetTraitsVoxel, GetTraitsVolume {
    expr: VolumeEmitter | null;
}
/**
 * Properties for {@link MathboxSelection.volume | volume}.
 * @category data
 */
export interface VolumeProps extends SetTraitsNode, SetTraitsBuffer, SetTraitsData, SetTraitsTexture, SetTraitsVoxel, SetTraitsVolume {
    expr?: VolumeEmitter;
}
/**
 * Normalized properties for {@link MathboxSelection.voxel | voxel}.
 * @category data
 */
export interface VoxelPropsNormalized extends GetTraitsNode, GetTraitsBuffer, GetTraitsData, GetTraitsTexture, GetTraitsVoxel {
    expr: VoxelEmitter | null;
}
/**
 * Properties for {@link MathboxSelection.voxel | voxel}.
 * @category data
 */
export interface VoxelProps extends SetTraitsNode, SetTraitsBuffer, SetTraitsData, SetTraitsTexture, SetTraitsVoxel {
    expr?: VoxelEmitter;
}
export {};

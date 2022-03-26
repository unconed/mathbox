declare namespace _default {
    export namespace node {
        const id: string[];
        const classes: string[];
    }
    export namespace entity {
        const active: string[];
    }
    export namespace object {
        const visible: string[];
    }
    export namespace unit {
        const scale: (string | number)[];
        const fov: (string | number)[];
        const focus: (string | number)[];
    }
    export namespace span {
        const range: string[];
    }
    export namespace view {
        const range_1: string[];
        export { range_1 as range };
    }
    export namespace view3 {
        export const position: string[];
        export const quaternion: string[];
        export const rotation: string[];
        const scale_1: string[];
        export { scale_1 as scale };
        export const eulerOrder: string[];
    }
    export namespace view4 {
        const position_1: string[];
        export { position_1 as position };
        const scale_2: string[];
        export { scale_2 as scale };
    }
    export namespace layer {
        const depth: string[];
        const fit: string[];
    }
    export namespace vertex {
        const pass: string[];
    }
    export namespace fragment {
        const pass_1: string[];
        export { pass_1 as pass };
        export const gamma: string[];
    }
    export namespace transform3 {
        const position_2: string[];
        export { position_2 as position };
        const quaternion_1: string[];
        export { quaternion_1 as quaternion };
        const rotation_1: string[];
        export { rotation_1 as rotation };
        const scale_3: string[];
        export { scale_3 as scale };
        const eulerOrder_1: string[];
        export { eulerOrder_1 as eulerOrder };
        export const matrix: string[];
    }
    export namespace transform4 {
        const position_3: string[];
        export { position_3 as position };
        const scale_4: string[];
        export { scale_4 as scale };
        const matrix_1: string[];
        export { matrix_1 as matrix };
    }
    export namespace camera {
        export const proxy: string[];
        const position_4: string[];
        export { position_4 as position };
        const quaternion_2: string[];
        export { quaternion_2 as quaternion };
        const rotation_2: string[];
        export { rotation_2 as rotation };
        export const lookAt: string[];
        export const up: string[];
        const eulerOrder_2: string[];
        export { eulerOrder_2 as eulerOrder };
        const fov_1: string[];
        export { fov_1 as fov };
    }
    export namespace polar {
        const bend: string[];
        const helix: string[];
    }
    export namespace spherical {
        const bend_1: string[];
        export { bend_1 as bend };
    }
    export namespace stereographic {
        const bend_2: string[];
        export { bend_2 as bend };
    }
    export namespace interval {
        const axis: string[];
    }
    export namespace area {
        const axes: string[];
    }
    export namespace volume {
        const axes_1: string[];
        export { axes_1 as axes };
    }
    export namespace origin {
        const origin_1: string[];
        export { origin_1 as origin };
    }
    export namespace scale_5 {
        export const divide: string[];
        const unit_1: string[];
        export { unit_1 as unit };
        export const base: string[];
        export const mode: string[];
        export const start: string[];
        export const end: string[];
        export const zero: string[];
        export const factor: string[];
        export const nice: string[];
    }
    export { scale_5 as scale };
    export namespace grid {
        const lineX: string[];
        const lineY: string[];
        const crossed: string[];
        const closedX: string[];
        const closedY: string[];
    }
    export namespace axis_1 {
        export const detail: (string | number)[];
        const crossed_1: string[];
        export { crossed_1 as crossed };
    }
    export { axis_1 as axis };
    export namespace data {
        const data_1: (string | null)[];
        export { data_1 as data };
        export const expr: (string | null)[];
        export const live: (string | boolean)[];
    }
    export namespace buffer {
        const channels: (string | number)[];
        const items: (string | number)[];
        const fps: (string | number)[];
        const hurry: (string | number)[];
        const limit: (string | number)[];
        const realtime: (string | boolean)[];
        const observe: (string | boolean)[];
        const aligned: (string | boolean)[];
    }
    export namespace sampler {
        const centered: string[];
        const padding: string[];
    }
    export namespace array {
        const width: string[];
        const bufferWidth: string[];
        const history: string[];
    }
    export namespace matrix_2 {
        const width_1: string[];
        export { width_1 as width };
        export const height: string[];
        const history_1: string[];
        export { history_1 as history };
        const bufferWidth_1: string[];
        export { bufferWidth_1 as bufferWidth };
        export const bufferHeight: string[];
    }
    export { matrix_2 as matrix };
    export namespace voxel {
        const width_2: string[];
        export { width_2 as width };
        const height_1: string[];
        export { height_1 as height };
        const depth_1: string[];
        export { depth_1 as depth };
        const bufferWidth_2: string[];
        export { bufferWidth_2 as bufferWidth };
        const bufferHeight_1: string[];
        export { bufferHeight_1 as bufferHeight };
        export const bufferDepth: string[];
    }
    export namespace style {
        const opacity: string[];
        const color: string[];
        const blending: string[];
        const zWrite: (string | boolean)[];
        const zTest: (string | boolean)[];
        const zIndex: string[];
        const zBias: string[];
        const zOrder: string[];
    }
    export namespace geometry {
        const points: string[];
        const colors: string[];
    }
    export namespace point {
        export const size: (string | number)[];
        export const sizes: string[];
        export const shape: string[];
        export const optical: (string | boolean)[];
        export const fill: (string | boolean)[];
        const depth_2: (string | number)[];
        export { depth_2 as depth };
    }
    export namespace line {
        const width_3: (string | number)[];
        export { width_3 as width };
        export const stroke: string[];
        const depth_3: (string | number)[];
        export { depth_3 as depth };
        export const proximity: string[];
        export const closed: (string | boolean)[];
    }
    export namespace mesh {
        const fill_1: (string | boolean)[];
        export { fill_1 as fill };
        export const shaded: (string | boolean)[];
        export const map: string[];
        export const lineBias: (string | number)[];
    }
    export namespace strip {
        const line_1: (string | boolean)[];
        export { line_1 as line };
    }
    export namespace face {
        const line_2: (string | boolean)[];
        export { line_2 as line };
    }
    export namespace arrow {
        const size_1: (string | number)[];
        export { size_1 as size };
        const start_1: (string | boolean)[];
        export { start_1 as start };
        const end_1: (string | boolean)[];
        export { end_1 as end };
    }
    export namespace ticks {
        export const normal: (string | boolean)[];
        const size_2: (string | number)[];
        export { size_2 as size };
        export const epsilon: (string | number)[];
    }
    export namespace attach {
        export const offset: string[];
        export const snap: (string | boolean)[];
        const depth_4: (string | number)[];
        export { depth_4 as depth };
    }
    export namespace format {
        export const digits: (string | number)[];
        const data_2: string[];
        export { data_2 as data };
        const expr_1: (string | null)[];
        export { expr_1 as expr };
        const live_1: (string | boolean)[];
        export { live_1 as live };
    }
    export namespace font {
        const font_1: string[];
        export { font_1 as font };
        const style_1: string[];
        export { style_1 as style };
        export const variant: string[];
        export const weight: string[];
        const detail_1: string[];
        export { detail_1 as detail };
        export const sdf: string[];
    }
    export namespace label {
        export const text: string[];
        const size_3: string[];
        export { size_3 as size };
        export const outline: string[];
        export const expand: string[];
        export const background: string[];
    }
    export namespace overlay {
        const opacity_1: (string | number)[];
        export { opacity_1 as opacity };
        const zIndex_1: string[];
        export { zIndex_1 as zIndex };
    }
    export namespace dom {
        const points_1: string[];
        export { points_1 as points };
        export const html: string[];
        const size_4: string[];
        export { size_4 as size };
        const outline_1: string[];
        export { outline_1 as outline };
        export const zoom: string[];
        const color_1: string[];
        export { color_1 as color };
        export const attributes: string[];
        export const pointerEvents: (string | boolean)[];
    }
    export namespace texture {
        const minFilter: string[];
        const magFilter: string[];
        const type: string[];
    }
    export namespace shader {
        const sources: string[];
        const language: string[];
        const code: string[];
        const uniforms: string[];
    }
    export namespace include {
        const shader_1: string[];
        export { shader_1 as shader };
    }
    export namespace operator {
        const source: string[];
    }
    export namespace spread {
        const unit_2: string[];
        export { unit_2 as unit };
        const items_1: string[];
        export { items_1 as items };
        const width_4: string[];
        export { width_4 as width };
        const height_2: string[];
        export { height_2 as height };
        const depth_5: string[];
        export { depth_5 as depth };
        export const alignItems: (string | number)[];
        export const alignWidth: (string | number)[];
        export const alignHeight: (string | number)[];
        export const alignDepth: (string | number)[];
    }
    export namespace grow {
        const scale_6: (string | number)[];
        export { scale_6 as scale };
        const items_2: (string | number)[];
        export { items_2 as items };
        const width_5: (string | number)[];
        export { width_5 as width };
        const height_3: (string | number)[];
        export { height_3 as height };
        const depth_6: (string | number)[];
        export { depth_6 as depth };
    }
    export namespace split {
        export const order: string[];
        const axis_2: string[];
        export { axis_2 as axis };
        export const length: (string | number)[];
        export const overlap: (string | number)[];
    }
    export namespace join {
        const order_1: string[];
        export { order_1 as order };
        const axis_3: string[];
        export { axis_3 as axis };
        const overlap_1: (string | number)[];
        export { overlap_1 as overlap };
    }
    export namespace swizzle {
        const order_2: string[];
        export { order_2 as order };
    }
    export namespace transpose {
        const order_3: string[];
        export { order_3 as order };
    }
    export namespace repeat {
        const items_3: string[];
        export { items_3 as items };
        const width_6: string[];
        export { width_6 as width };
        const height_4: string[];
        export { height_4 as height };
        const depth_7: string[];
        export { depth_7 as depth };
    }
    export namespace slice {
        const items_4: string[];
        export { items_4 as items };
        const width_7: string[];
        export { width_7 as width };
        const height_5: string[];
        export { height_5 as height };
        const depth_8: string[];
        export { depth_8 as depth };
    }
    export namespace lerp {
        const size_5: string[];
        export { size_5 as size };
        const items_5: string[];
        export { items_5 as items };
        const width_8: string[];
        export { width_8 as width };
        const height_6: string[];
        export { height_6 as height };
        const depth_9: string[];
        export { depth_9 as depth };
    }
    export namespace subdivide {
        const items_6: string[];
        export { items_6 as items };
        const width_9: string[];
        export { width_9 as width };
        const height_7: string[];
        export { height_7 as height };
        const depth_10: string[];
        export { depth_10 as depth };
        export const bevel: string[];
        const lerp_1: string[];
        export { lerp_1 as lerp };
    }
    export namespace resample {
        export const indices: (string | number)[];
        const channels_1: (string | number)[];
        export { channels_1 as channels };
        export const sample: string[];
        const size_6: string[];
        export { size_6 as size };
        const items_7: string[];
        export { items_7 as items };
        const width_10: string[];
        export { width_10 as width };
        const height_8: string[];
        export { height_8 as height };
        const depth_11: string[];
        export { depth_11 as depth };
    }
    export namespace readback {
        const type_1: string[];
        export { type_1 as type };
        const expr_2: string[];
        export { expr_2 as expr };
        const data_3: string[];
        export { data_3 as data };
        const channels_2: string[];
        export { channels_2 as channels };
        const items_8: string[];
        export { items_8 as items };
        const width_11: string[];
        export { width_11 as width };
        const height_9: string[];
        export { height_9 as height };
        const depth_12: string[];
        export { depth_12 as depth };
    }
    export namespace root {
        export const speed: (string | number)[];
        const camera_1: string[];
        export { camera_1 as camera };
    }
    export namespace inherit {
        const source_1: string[];
        export { source_1 as source };
        export const traits: string[];
    }
    export namespace rtt {
        const width_12: string[];
        export { width_12 as width };
        const height_10: string[];
        export { height_10 as height };
        const history_2: (string | number)[];
        export { history_2 as history };
    }
    export namespace compose {
        const alpha: (string | boolean)[];
    }
    export namespace present {
        export const index: string[];
        const length_1: string[];
        export { length_1 as length };
        export const directed: string[];
    }
    export namespace slide {
        const order_4: (string | number)[];
        export { order_4 as order };
        export const steps: (string | number)[];
        export const early: (string | number)[];
        export const late: (string | number)[];
        export const from: string[];
        export const to: string[];
    }
    export namespace transition {
        const stagger: string[];
        const enter: string[];
        const exit: string[];
        const delay: string[];
        const delayEnter: string[];
        const delayExit: string[];
        const duration: string[];
        const durationEnter: string[];
        const durationExit: string[];
    }
    export namespace move {
        const from_1: string[];
        export { from_1 as from };
        const to_1: string[];
        export { to_1 as to };
    }
    export namespace seek {
        const seek_1: string[];
        export { seek_1 as seek };
    }
    export namespace track {
        const target: string[];
        const script: string[];
        const ease: string[];
    }
    export namespace trigger {
        const trigger_1: (string | number)[];
        export { trigger_1 as trigger };
    }
    export namespace step {
        export const playback: string[];
        export const stops: string[];
        const delay_1: string[];
        export { delay_1 as delay };
        const duration_1: string[];
        export { duration_1 as duration };
        export const pace: string[];
        const speed_1: string[];
        export { speed_1 as speed };
        export const rewind: string[];
        export const skip: (string | boolean)[];
        const realtime_1: (string | boolean)[];
        export { realtime_1 as realtime };
    }
    export namespace play {
        const delay_2: string[];
        export { delay_2 as delay };
        const pace_1: string[];
        export { pace_1 as pace };
        const speed_2: string[];
        export { speed_2 as speed };
        const from_2: string[];
        export { from_2 as from };
        const to_2: string[];
        export { to_2 as to };
        const realtime_2: (string | boolean)[];
        export { realtime_2 as realtime };
        export const loop: (string | boolean)[];
    }
    export namespace now {
        const now_1: (string | number)[];
        export { now_1 as now };
        const seek_2: (string | null)[];
        export { seek_2 as seek };
        const pace_2: (string | number)[];
        export { pace_2 as pace };
        const speed_3: (string | number)[];
        export { speed_3 as speed };
    }
}
export default _default;

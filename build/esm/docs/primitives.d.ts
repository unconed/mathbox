declare namespace _default {
    const axis: (string | {
        end?: undefined;
        zBias?: undefined;
    } | {
        end: string;
        zBias: string;
    })[];
    const face: string[];
    const grid: (string | {
        width?: undefined;
        zBias?: undefined;
    } | {
        width: string;
        zBias: string;
    })[];
    const line: string[];
    const point: string[];
    const strip: string[];
    const surface: (string | {
        lineX?: undefined;
        lineY?: undefined;
    } | {
        lineX: string;
        lineY: string;
    })[];
    const ticks: string[];
    const vector: string[];
    const view: string[];
    const cartesian: string[];
    const cartesian4: string[];
    const polar: string[];
    const spherical: string[];
    const stereographic: string[];
    const stereographic4: string[];
    const transform: string[];
    const transform4: string[];
    const vertex: string[];
    const fragment: string[];
    const layer: string[];
    const mask: string[];
    const array: (string | {
        expr: string;
    })[];
    const interval: (string | {
        expr: string;
    })[];
    const matrix: (string | {
        expr: string;
    })[];
    const area: (string | {
        expr: string;
    })[];
    const voxel: (string | {
        expr: string;
    })[];
    const volume: (string | {
        expr: string;
    })[];
    const scale: string[];
    const html: string[];
    const dom: string[];
    const text: (string | {
        minFilter?: undefined;
        magFilter?: undefined;
    } | {
        minFilter: string;
        magFilter: string;
    })[];
    const format: (string | {
        expr: string;
        minFilter?: undefined;
        magFilter?: undefined;
    } | {
        minFilter: string;
        magFilter: string;
        expr?: undefined;
    })[];
    const retext: string[];
    const label: string[];
    const clamp: string[];
    const grow: string[];
    const join: string[];
    const lerp: string[];
    const memo: string[];
    const readback: (string | {
        expr: string;
    })[];
    const resample: string[];
    const repeat: string[];
    const swizzle: string[];
    const spread: string[];
    const split: string[];
    const slice: string[];
    const subdivide: string[];
    const transpose: string[];
    const group: string[];
    const inherit: string[];
    const root: string[];
    const unit: string[];
    const shader: string[];
    const camera: string[];
    const rtt: (string | {
        minFilter?: undefined;
        magFilter?: undefined;
        type?: undefined;
    } | {
        minFilter: string;
        magFilter: string;
        type: string;
    })[];
    const compose: (string | {
        zWrite?: undefined;
        zTest?: undefined;
        color?: undefined;
    } | {
        zWrite: string;
        zTest: string;
        color: string;
    })[];
    const clock: string[];
    const now: string[];
    const move: string[];
    const play: string[];
    const present: string[];
    const reveal: string[];
    const slide: string[];
    const step: string[];
}
export default _default;

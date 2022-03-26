export function getSizes(data: any): any[];
export function getDimensions(data: any, spec: any): {
    items: any;
    channels: any;
    width: any;
    height: any;
    depth: any;
};
export function repeatCall(call: any, times: any): (() => any) | undefined;
export function makeEmitter(thunk: any, items: any, channels: any): (emit: any) => any;
export function getThunk(data: any): (() => any) | undefined;
export function getStreamer(array: any, samples: any, channels: any, items: any): {
    emit: ((x: any, y: any, z: any, w: any) => void) | undefined;
    consume: ((emit: any) => void) | undefined;
    skip: ((n: any) => void) | undefined;
    count: () => any;
    done: () => boolean;
    reset: () => number;
};
export function getLerpEmitter(expr1: any, expr2: any): (emit: any, x: any, y: any, z: any, w: any, i: any, j: any, k: any, l: any, d: any, t: any) => any[];
export function getLerpThunk(data1: any, data2: any): Float32Array;

export class Readback extends Renderable {
    constructor(renderer: any, shaders: any, options: any);
    items: any;
    channels: any;
    width: any;
    height: any;
    depth: any;
    type: any;
    stpq: any;
    isFloat: boolean;
    active: {
        items: number;
        width: number;
        height: number;
        depth: number;
    } | null;
    sampled: {
        items: number;
        width: number;
        height: number;
        depth: number;
    } | null;
    rect: {
        w: number;
        h: number;
    } | null;
    pad: {
        x: number;
        y: number;
        z: number;
        w: number;
    } | null;
    build(options: any): number[] | undefined;
    floatMemo: Memo | null | undefined;
    floatCompose: MemoScreen | null | undefined;
    byteMemo: Memo | null | undefined;
    byteCompose: MemoScreen | null | undefined;
    samples: number | undefined;
    bytes: Uint8Array | undefined;
    floats: Float32Array | undefined;
    data: Uint8Array | Float32Array | undefined;
    streamer: {
        emit: ((x: any, y: any, z: any, w: any) => void) | undefined;
        consume: ((emit: any) => void) | undefined;
        skip: ((n: any) => void) | undefined;
        count: () => any;
        done: () => boolean;
        reset: () => number;
    } | undefined;
    stretch: any;
    isIndexed: boolean | undefined;
    generate(data: any): {
        emit: ((x: any, y: any, z: any, w: any) => void) | undefined;
        consume: ((emit: any) => void) | undefined;
        skip: ((n: any) => void) | undefined;
        count: () => any;
        done: () => boolean;
        reset: () => number;
    };
    setActive(items: any, width: any, height: any, depth: any): number[] | undefined;
    update(camera: any): number | undefined;
    post(): void;
    readFloat(n: any): any;
    readByte(n: any): any;
    setCallback(callback: any): void;
    emitter: any;
    callback(callback: any): any;
    iterate(): number;
    dispose(): null;
}
import { Renderable } from "../renderable.js";
import { Memo } from "./memo.js";
import { MemoScreen } from "../meshes/memoscreen.js";

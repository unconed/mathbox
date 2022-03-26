export class DataBuffer extends Buffer {
    constructor(renderer: any, shaders: any, options: any, build: any);
    width: any;
    height: any;
    depth: any;
    shader(shader: any, indices: any): any;
    build(options: any): void;
    data: Float32Array | null | undefined;
    texture: DataTexture | undefined;
    filled: number | undefined;
    used: any;
    dataPointer: any;
    streamer: {
        emit: ((x: any, y: any, z: any, w: any) => void) | undefined;
        consume: ((emit: any) => void) | undefined;
        skip: ((n: any) => void) | undefined;
        count: () => any;
        done: () => boolean;
        reset: () => number;
    } | undefined;
    getFilled(): number | undefined;
    setCallback(callback: any): number;
    copy(data: any): void;
    write(n: any): void;
    through(callback: any, target: any): () => any;
}
import { Buffer } from "./buffer.js";
import { DataTexture } from "./texture/datatexture.js";

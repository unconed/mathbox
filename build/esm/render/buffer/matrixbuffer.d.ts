export class MatrixBuffer extends DataBuffer {
    constructor(renderer: any, shaders: any, options: any);
    history: any;
    samples: number;
    wrap: boolean;
    build(_options: any): {
        emit: ((x: any, y: any, z: any, w: any) => void) | undefined;
        consume: ((emit: any) => void) | undefined;
        skip: ((n: any) => void) | undefined;
        count: () => any;
        done: () => boolean;
        reset: () => number;
    };
    index: any;
    pad: {
        x: number;
        y: number;
    } | undefined;
    setActive(i: any, j: any): number[];
    fill(): number;
    write(n: any): number;
}
import { DataBuffer } from "./databuffer.js";

export class VoxelBuffer extends DataBuffer {
    build(_options: any): {
        emit: ((x: any, y: any, z: any, w: any) => void) | undefined;
        consume: ((emit: any) => void) | undefined;
        skip: ((n: any) => void) | undefined;
        count: () => any;
        done: () => boolean;
        reset: () => number;
    };
    pad: {
        x: number;
        y: number;
        z: number;
    } | undefined;
    setActive(i: any, j: any, k: any): number[];
    fill(): number;
}
import { DataBuffer } from "./databuffer.js";

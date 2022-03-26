export class ItemBuffer extends DataBuffer {
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
        w: number;
    } | undefined;
    setActive(i: any, j: any, k: any, l: any): number[];
    fill(): number;
}
import { DataBuffer } from "./databuffer.js";

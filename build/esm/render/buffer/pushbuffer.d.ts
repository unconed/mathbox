export class PushBuffer extends Buffer {
    width: any;
    height: any;
    depth: any;
    build(_options: any): {
        emit: ((x: any, y: any, z: any, w: any) => void) | undefined;
        consume: ((emit: any) => void) | undefined;
        skip: ((n: any) => void) | undefined;
        count: () => any;
        done: () => boolean;
        reset: () => number;
    };
    data: any[] | null | undefined;
    filled: number | undefined;
    pad: {
        x: number;
        y: number;
        z: number;
    } | undefined;
    streamer: {
        emit: ((x: any, y: any, z: any, w: any) => void) | undefined;
        consume: ((emit: any) => void) | undefined;
        skip: ((n: any) => void) | undefined;
        count: () => any;
        done: () => boolean;
        reset: () => number;
    } | undefined;
    getFilled(): number | undefined;
    setActive(i: any, j: any, k: any): number[];
    read(): any[] | null | undefined;
    copy(data: any): any[];
    fill(): any;
}
import { Buffer } from "./buffer.js";

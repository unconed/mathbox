export class ArrayBuffer_ extends DataBuffer {
    constructor(renderer: any, shaders: any, options: any);
    history: any;
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
    pad: number | undefined;
    setActive(i: any): number;
    fill(): number;
    write(n: any): number;
}
import { DataBuffer } from "./databuffer.js";

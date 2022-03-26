export class Voxel extends Buffer {
    constructor(...args: any[]);
    update(): any;
    buffer: any;
    spec: {
        channels: any;
        items: any;
        width: any;
        height: any;
        depth: any;
    } | null | undefined;
    space: {
        width: number;
        height: number;
        depth: number;
    } | undefined;
    used: {
        width: number;
        height: number;
        depth: number;
    } | undefined;
    storage: string | undefined;
    passthrough: ((emit: any, x: any, y: any, z: any) => any) | undefined;
    getDimensions(): {
        items: any;
        width: number;
        height: number;
        depth: number;
    };
    getActiveDimensions(): {
        items: any;
        width: number;
        height: number;
        depth: number;
    };
    getRawDimensions(): {
        items: any;
        width: number;
        height: number;
        depth: number;
    };
    items: any;
    channels: any;
    unmake(): null | undefined;
    change(changed: any, touched: any, init: any): any;
}
import { Buffer } from "./buffer.js";

export class Matrix extends Buffer {
    buffer: any;
    spec: {
        channels: any;
        items: any;
        width: any;
        height: any;
    } | null | undefined;
    space: {
        width: number;
        height: number;
        history: number;
    } | undefined;
    used: {
        width: number;
        height: number;
    } | undefined;
    storage: string | undefined;
    passthrough: ((emit: any, x: any, y: any) => any) | undefined;
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
        depth: any;
    };
    getFutureDimensions(): {
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
    update(): any;
}
import { Buffer } from "./buffer.js";

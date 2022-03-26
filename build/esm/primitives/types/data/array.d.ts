export class Array_ extends Buffer {
    buffer: any;
    spec: {
        channels: any;
        items: any;
        width: any;
    } | null | undefined;
    space: {
        width: number;
        history: number;
    } | undefined;
    used: {
        width: number;
    } | undefined;
    storage: string | undefined;
    passthrough: ((emit: any, x: any) => any) | undefined;
    getDimensions(): {
        items: any;
        width: number;
        height: number;
        depth: number;
    };
    getActiveDimensions(): {
        items: any;
        width: number;
        height: any;
        depth: number;
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

export class Resolve extends Data {
    buffer: any;
    spec: {
        channels: number;
        items: number;
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
    callback(): void;
    emitter(): any;
    change(changed: any, touched: any, init: any): any;
    update(): any;
    filled: boolean | undefined;
}
import { Data } from "./data.js";

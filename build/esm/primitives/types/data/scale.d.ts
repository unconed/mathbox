export class Scale extends Source {
    init(): null;
    used: any;
    space: any;
    scaleAxis: any;
    sampler: any;
    rawBuffer(): any;
    getDimensions(): {
        items: number;
        width: any;
        height: number;
        depth: number;
    };
    getActiveDimensions(): {
        items: number;
        width: any;
        height: any;
        depth: number;
    };
    getRawDimensions(): {
        items: number;
        width: any;
        height: number;
        depth: number;
    };
    make(): any;
    buffer: any;
    scaleOffset: any;
    unmake(): any;
    change(changed: any, touched: any, init: any): any;
    updateRanges(): any;
}
import { Source } from "../base/source.js";

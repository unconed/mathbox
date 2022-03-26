export class Repeat extends Operator {
    getDimensions(): {
        items: number;
        width: number;
        height: number;
        depth: number;
    };
    getActiveDimensions(): {
        items: number;
        width: number;
        height: number;
        depth: number;
    };
    getFutureDimensions(): {
        items: number;
        width: number;
        height: number;
        depth: number;
    };
    getIndexDimensions(): {
        items: number;
        width: number;
        height: number;
        depth: number;
    };
    _resample(dims: any): {
        items: number;
        width: number;
        height: number;
        depth: number;
    };
    resample: {} | undefined;
    repeatModulus: any;
    operator: any;
    resize(): any;
    change(changed: any, touched: any, init: any): void | any[];
}
import { Operator } from "./operator.js";

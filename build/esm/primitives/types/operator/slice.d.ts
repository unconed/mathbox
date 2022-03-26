export class Slice extends Operator {
    _resolve(key: any, dims: any): any[];
    _resample(dims: any): any;
    make(): {
        sliceOffset: any;
    } | undefined;
    uniforms: {
        sliceOffset: any;
    } | undefined;
    resize(): any;
    change(changed: any, touched: any, _init: any): any;
}
import { Operator } from "./operator.js";

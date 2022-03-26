export class Track extends Primitive {
    init(): null;
    handlers: {} | undefined;
    script: any;
    values: any;
    playhead: number | undefined;
    velocity: any;
    section: any;
    expr: any;
    make(): any[];
    targetNode: any;
    unmake(): number;
    start: any;
    end: any;
    bindExpr(expr: any): any;
    measure: (() => number | undefined) | null | undefined;
    unbindExpr(): null;
    _process(object: any, script: any): any[];
    update(): any;
    change(changed: any, touched: any, init: any): any;
}
import { Primitive } from "../../primitive.js";

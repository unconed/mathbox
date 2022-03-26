export class Axis extends Primitive {
    axisPosition: any;
    axisStep: any;
    resolution: number | null;
    line: any;
    arrows: any[] | null;
    make(): any;
    unmake(): any;
    change(changed: any, touched: any, init: any): any;
    updateRanges(): any;
}
import { Primitive } from "../../primitive.js";

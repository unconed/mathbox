export class DOM extends Primitive {
    emitter: {
        (x: any, y: any, z: any, w: any, i: any, j: any, k: any, l: any): number;
        reset(): "auto" | undefined;
        nodes(): any[];
    } | null | undefined;
    root: any;
    active: {} | undefined;
    readback: any;
    dom: any;
    unmake(): void;
    update(): void;
    post(): void;
    callback(data: any): {
        (x: any, y: any, z: any, w: any, i: any, j: any, k: any, l: any): number;
        reset(): "auto" | undefined;
        nodes(): any[];
    };
    resize(): void;
    strideI: any;
    strideJ: number | undefined;
    strideK: number | undefined;
}
import { Primitive } from "../../primitive.js";

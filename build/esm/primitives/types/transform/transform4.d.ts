export class Transform4 extends Transform {
    make(): any;
    uniforms: {
        transformMatrix: any;
        transformOffset: any;
    } | undefined;
    transformMatrix: any;
    unmake(): boolean;
    change(changed: any, touched: any, init: any): any;
}
import { Transform } from "./transform.js";

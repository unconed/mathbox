export class Layer extends Transform {
    make(): {
        layerScale: any;
        layerBias: any;
    };
    uniforms: {
        layerScale: any;
        layerBias: any;
    } | undefined;
    update(): any;
    change(changed: any, touched: any, init: any): any;
}
import { Transform } from "./transform.js";

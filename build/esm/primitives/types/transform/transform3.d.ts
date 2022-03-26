export class Transform3 extends Transform {
    make(): (position: any, rotation: any, quaternion: any, scale: any, matrix: any, eulerOrder: any) => any;
    uniforms: {
        transformMatrix: any;
    } | undefined;
    composer: ((position: any, rotation: any, quaternion: any, scale: any, matrix: any, eulerOrder: any) => any) | undefined;
    unmake(): boolean;
    change(changed: any, touched: any, init: any): any;
}
import { Transform } from "./transform.js";

export class Spherical extends View {
    make(): number;
    uniforms: {
        sphericalBend: any;
        sphericalFocus: any;
        sphericalAspectX: any;
        sphericalAspectY: any;
        sphericalScaleY: any;
        viewMatrix: any;
    } | undefined;
    viewMatrix: any;
    composer: ((position: any, rotation: any, quaternion: any, scale: any, matrix: any, eulerOrder: any) => any) | undefined;
    aspectX: number | undefined;
    aspectY: number | undefined;
    unmake(): boolean;
    change(changed: any, touched: any, init: any): any;
    bend: any;
    focus: number | undefined;
    scaleY: number | undefined;
}
import { View } from "./view.js";

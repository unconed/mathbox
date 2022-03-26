export class Stereographic extends View {
    make(): (position: any, rotation: any, quaternion: any, scale: any, matrix: any, eulerOrder: any) => any;
    uniforms: {
        stereoBend: any;
        viewMatrix: any;
    } | undefined;
    viewMatrix: any;
    composer: ((position: any, rotation: any, quaternion: any, scale: any, matrix: any, eulerOrder: any) => any) | undefined;
    unmake(): boolean;
    change(changed: any, touched: any, init: any): any;
    bend: any;
}
import { View } from "./view.js";

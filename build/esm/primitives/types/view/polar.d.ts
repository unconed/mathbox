export class Polar extends View {
    make(): number;
    uniforms: {
        polarBend: any;
        polarHelix: any;
        polarFocus: any;
        polarAspect: any;
        viewMatrix: any;
    } | undefined;
    viewMatrix: any;
    composer: ((position: any, rotation: any, quaternion: any, scale: any, matrix: any, eulerOrder: any) => any) | undefined;
    aspect: number | undefined;
    unmake(): boolean;
    helix: any;
    bend: any;
    focus: number | undefined;
}
import { View } from "./view.js";

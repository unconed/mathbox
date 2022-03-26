export class Cartesian extends View {
    make(): void;
    uniforms: {
        viewMatrix: any;
    } | undefined;
    viewMatrix: any;
    composer: ((position: any, rotation: any, quaternion: any, scale: any, matrix: any, eulerOrder: any) => any) | undefined;
    unmake(): void;
}
import { View } from "./view.js";

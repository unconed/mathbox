export class Stereographic4 extends View {
    make(): void;
    uniforms: {
        basisOffset: any;
        basisScale: any;
        stereoBend: any;
    } | undefined;
    basisScale: any;
    basisOffset: any;
    unmake(): void;
    bend: any;
}
import { View } from "./view.js";

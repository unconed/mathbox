export class Cartesian4 extends View {
    uniforms: {
        basisOffset: any;
        basisScale: any;
    } | undefined;
    basisScale: any;
    basisOffset: any;
    unmake(): boolean;
    change(changed: any, touched: any, init: any): any;
}
import { View } from "./view.js";

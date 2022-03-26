export class ArrowGeometry extends ClipGeometry {
    constructor(options: any);
    sides: number;
    samples: number;
    strips: number;
    ribbons: number;
    layers: number;
    flip: any;
    anchor: any;
    clip(samples: any, strips: any, ribbons: any, layers: any): void;
}
import { ClipGeometry } from "./clipgeometry.js";

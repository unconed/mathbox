export class LineGeometry extends ClipGeometry {
    constructor(options: any);
    closed: any;
    samples: number;
    strips: number;
    ribbons: number;
    layers: number;
    detail: number;
    joints: number;
    vertices: number;
    segments: number;
    clip(samples: any, strips: any, ribbons: any, layers: any): void;
}
import { ClipGeometry } from "./clipgeometry.js";

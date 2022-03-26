export class FaceGeometry extends ClipGeometry {
    constructor(options: any);
    items: number;
    width: number;
    height: number;
    depth: number;
    sides: number;
    clip(width: any, height: any, depth: any, items: any): void;
}
import { ClipGeometry } from "./clipgeometry.js";

export class SurfaceGeometry extends ClipGeometry {
    constructor(options: any, build: any);
    construct(options: any): void;
    closedX: any;
    closedY: any;
    width: number | undefined;
    height: number | undefined;
    surfaces: number | undefined;
    layers: number | undefined;
    segmentsX: number | undefined;
    segmentsY: number | undefined;
    clip(width: any, height: any, surfaces: any, layers: any): void;
    map(width: any, height: any, surfaces: any, layers: any): any;
}
import { ClipGeometry } from "./clipgeometry.js";

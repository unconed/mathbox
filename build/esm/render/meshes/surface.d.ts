export class Surface extends Base {
    geometry: SurfaceGeometry;
    material: any;
    renders: any[];
}
import { Base } from "./base.js";
import { SurfaceGeometry } from "../geometry/surfacegeometry.js";

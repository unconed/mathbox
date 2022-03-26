export class Line extends Base {
    geometry: LineGeometry;
    material: any;
    renders: any[];
}
import { Base } from "./base.js";
import { LineGeometry } from "../geometry/linegeometry.js";

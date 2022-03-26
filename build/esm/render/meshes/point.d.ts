export class Point extends Base {
    geometry: SpriteGeometry;
    fillMaterial: any;
    edgeMaterial: any;
    fillObject: any;
    edgeObject: any;
    renders: any[];
    show(transparent: any, blending: any, order: any, depth: any): null;
}
import { Base } from "./base.js";
import { SpriteGeometry } from "../geometry/spritegeometry.js";

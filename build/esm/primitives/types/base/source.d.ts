export class Source extends Primitive {
    made(): any;
    indexShader(shader: any): any;
    sourceShader(shader: any): any;
    getDimensions(): {
        items: number;
        width: number;
        height: number;
        depth: number;
    };
    getActiveDimensions(): {
        items: number;
        width: number;
        height: number;
        depth: number;
    };
    getIndexDimensions(): {
        items: number;
        width: number;
        height: number;
        depth: number;
    };
    getFutureDimensions(): {
        items: number;
        width: number;
        height: number;
        depth: number;
    };
}
import { Primitive } from "../../primitive.js";

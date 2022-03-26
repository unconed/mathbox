export class ClipGeometry extends Geometry {
    _clipUniforms(): {
        type: string;
        value: any;
    };
    geometryClip: any;
    geometryResolution: any;
    mapSize: any;
    _clipGeometry(width: any, height: any, depth: any, items: any): any;
    _clipMap(mapWidth: any, mapHeight: any, mapDepth: any, mapItems: any): any;
    _clipOffsets(factor: any, width: any, height: any, depth: any, items: any, _width: any, _height: any, _depth: any, _items: any): void;
}
import { Geometry } from "./geometry.js";

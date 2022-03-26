export class Base extends Renderable {
    constructor(renderer: any, shaders: any, options: any);
    zUnits: any;
    raw(): null;
    depth(write: any, test: any): null;
    polygonOffset(factor: any, units: any): null;
    show(transparent: any, blending: any, order: any): null[];
    hide(): null;
    _material(options: any): any;
    _raw(object: any): void;
    _depth(object: any, write: any, test: any): any;
    _polygonOffset(object: any, factor: any, units: any): any;
    _show(object: any, transparent: any, blending: any, order: any): null;
    _hide(object: any): boolean;
    _vertexColor(color: any, mask: any): any;
    _vertexPosition(position: any, material: any, map: any, channels: any, stpq: any): any;
    _fragmentColor(hasStyle: any, material: any, color: any, mask: any, map: any, channels: any, stpq: any, combine: any, linear: any): any;
}
import { Renderable } from "../renderable.js";

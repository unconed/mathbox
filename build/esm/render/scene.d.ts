export class Scene extends Renderable {
    constructor(renderer: any, shaders: any, options: any);
    root: MathBox;
    scene: any;
    pending: any[];
    async: number;
    scratch: any;
    camera: any;
    inject(scene: any): any;
    unject(): any;
    add(object: any): any;
    remove(object: any): any;
    _add(object: any): any;
    _remove(object: any): any;
    dispose(): any;
    warmup(n: any): number;
    render(): any;
    toJSON(): any;
}
import { Renderable } from "./renderable.js";
declare class MathBox {
    rotationAutoUpdate: boolean;
    frustumCulled: boolean;
    matrixAutoUpdate: boolean;
}
export {};

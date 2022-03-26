export class Atlas extends Renderable {
    constructor(renderer: any, shaders: any, options: any, build: any);
    width: any;
    height: any;
    channels: any;
    backed: any;
    samples: number;
    shader(shader: any): any;
    build(options: any): number;
    klass: typeof DataTexture | undefined;
    texture: DataTexture | undefined;
    reset(): number;
    rows: any[] | undefined;
    bottom: any;
    resize(width: any, height: any): number;
    collapse(row: any): null | undefined;
    last: any;
    allocate(key: any, width: any, height: any, emit: any): any;
    read(): any;
    write(data: any, x: any, y: any, w: any, h: any): any;
    data: any;
}
import { Renderable } from "../renderable.js";
import { DataTexture } from "./texture/datatexture.js";

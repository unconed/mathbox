export class RenderToTexture extends Renderable {
    constructor(renderer: any, shaders: any, options: any);
    scene: any;
    camera: any;
    shaderRelative(shader: any): any;
    shaderAbsolute(shader: any, frames: any, indices: any): any;
    build(options: any): number;
    target: RenderTarget | undefined;
    filled: number | undefined;
    adopt(renderable: any): any[];
    unadopt(renderable: any): any[];
    render(camera: any): number | undefined;
    read(frame: any): any;
    getFrames(): any;
    getFilled(): number | undefined;
}
import { Renderable } from "../renderable.js";
import { RenderTarget } from "./texture/rendertarget.js";

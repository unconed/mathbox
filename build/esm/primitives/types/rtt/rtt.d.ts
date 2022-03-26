export class RTT extends Parent {
    init(): null;
    rtt: any;
    scene: any;
    camera: any;
    width: any;
    height: any;
    history: any;
    rootSize: any;
    size: any;
    indexShader(shader: any): any;
    imageShader(shader: any): any;
    sourceShader(shader: any): any;
    getDimensions(): {
        items: number;
        width: any;
        height: any;
        depth: any;
    };
    getActiveDimensions(): {
        items: number;
        width: any;
        height: any;
        depth: any;
    };
    make(): {
        renderWidth: any;
        renderHeight: any;
        aspect: any;
        viewWidth: any;
        viewHeight: any;
        pixelRatio: number;
    } | undefined;
    parentRoot: any;
    aspect: number | undefined;
    made(): any;
    unmake(rebuild: any): null | undefined;
    change(changed: any, touched: any, init: any): any;
    adopt(renderable: any): any[];
    unadopt(renderable: any): any[];
    resize(size: any): void;
    select(selector: any): any;
    watch(selector: any, handler: any): any;
    unwatch(handler: any): any;
    pre(e: any): any;
    update(e: any): any;
    render(e: any): any;
    post(e: any): any;
    setCamera(): any;
    getOwnCamera(): any;
    getCamera(): any;
    vertex(shader: any, pass: any): any;
}
import { Parent } from "../base/parent.js";

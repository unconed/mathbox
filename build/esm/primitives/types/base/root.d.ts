export class Root extends Parent {
    init(): null;
    size: any;
    cameraEvent: {
        type: string;
    } | undefined;
    preEvent: {
        type: string;
    } | undefined;
    updateEvent: {
        type: string;
    } | undefined;
    renderEvent: {
        type: string;
    } | undefined;
    postEvent: {
        type: string;
    } | undefined;
    clockEvent: {
        type: string;
    } | undefined;
    camera: any;
    make(): any;
    unmake(): any;
    change(changed: any, touched: any, init: any): any;
    adopt(renderable: any): any[];
    unadopt(renderable: any): any[];
    select(selector: any): any;
    watch(selector: any, handler: any): any;
    unwatch(handler: any): any;
    resize(size: any): any;
    getSize(): any;
    getSpeed(): any;
    getUnit(): any;
    getUnitUniforms(): any;
    pre(): any;
    update(): any;
    render(): any;
    post(): any;
    setCamera(): any;
    getCamera(): any;
    getTime(): any;
    vertex(shader: any, pass: any): any;
}
import { Parent } from "./parent.js";

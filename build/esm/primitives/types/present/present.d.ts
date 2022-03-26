export class Present extends Parent {
    make(): any;
    nodes: any;
    steps: any[] | undefined;
    length: number | undefined;
    last: any;
    index: any;
    dirty: any[] | undefined;
    adopt(controller: any): number;
    unadopt(controller: any): number;
    update(): never[] | undefined;
    slideLatch(controller: any, enabled: any, step: any): any;
    slideStep(controller: any, index: any, step: any): any;
    slideRelease(controller: any, _step: any): any;
    slideReset(controller: any): any;
    mapIndex(controller: any, index: any): number;
    process(nodes: any): {}[];
    go(index: any): void;
}
import { Parent } from "../base/parent.js";

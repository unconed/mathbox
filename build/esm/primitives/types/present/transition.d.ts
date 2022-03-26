export class Transition extends Parent {
    init(): null;
    animate: any;
    uniforms: {
        transitionFrom: any;
        transitionTo: any;
        transitionActive: any;
        transitionScale: any;
        transitionBias: any;
        transitionEnter: any;
        transitionExit: any;
        transitionSkew: any;
    } | null | undefined;
    state: {
        isVisible: boolean;
        isActive: boolean;
        enter: number;
        exit: number;
    } | undefined;
    latched: {
        isVisible: boolean;
        isActive: boolean;
        step: any;
    } | null | undefined;
    locked: {
        isVisible: boolean;
        isActive: boolean;
    } | null | undefined;
    make(): boolean;
    move: boolean | undefined;
    unmake(): any;
    latch(step: any): any;
    release(): any;
    complete(done: any): any;
    update(): any;
    isVisible: any;
    isActive: any;
    change(changed: any, touched: any, init: any): any;
}
import { Parent } from "../base/parent.js";

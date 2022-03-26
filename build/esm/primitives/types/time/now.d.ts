export class Now extends Parent {
    init(): {
        now: number;
        time: number;
        delta: number;
        clock: number;
        step: number;
    };
    now: number | undefined;
    skew: any;
    time: {
        now: number;
        time: number;
        delta: number;
        clock: number;
        step: number;
    } | undefined;
    make(): any;
    clockParent: any;
    unmake(): null;
    change(changed: any, _touched: any, _init: any): 0 | undefined;
    tick(e: any): any;
    getTime(): {
        now: number;
        time: number;
        delta: number;
        clock: number;
        step: number;
    } | undefined;
}
import { Parent } from "../base/parent.js";

export class Clock extends Parent {
    init(): {
        now: number;
        time: number;
        delta: number;
        clock: number;
        step: number;
    };
    skew: number | undefined;
    last: any;
    time: {
        now: number;
        time: number;
        delta: number;
        clock: number;
        step: number;
    } | undefined;
    make(): any;
    reset(): number;
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

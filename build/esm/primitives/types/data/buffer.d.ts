export class Buffer extends Data {
    init(): void;
    bufferSlack: any;
    bufferFrames: number | undefined;
    bufferTime: any;
    bufferDelta: any;
    bufferClock: any;
    bufferStep: any;
    clockParent: any;
    rawBuffer(): any;
    emitter(): any;
    change(changed: any, touched: any, init: any): number | undefined;
    syncBuffer(callback: any): any;
    alignShader(dims: any, shader: any): any;
}
import { Data } from "./data.js";

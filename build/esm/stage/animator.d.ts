export class Animator {
    constructor(context: any);
    context: any;
    anims: any[];
    make(type: any, options: any): Animation;
    unmake(anim: any): any[];
    update(): any[];
    lerp(type: any, from: any, to: any, f: any, value: any): any;
}
declare class Animation {
    constructor(animator: any, time: any, type: any, options: any);
    animator: any;
    time: any;
    type: any;
    options: any;
    value: any;
    target: any;
    queue: any[];
    dispose(): any;
    set(...args: any[]): any;
    getTime(): any;
    cancel(from: any): void;
    notify(): any;
    immediate(value: any, options: any): number;
    update(time: any): any;
}
export {};

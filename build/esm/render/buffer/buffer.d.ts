export class Buffer extends Renderable {
    constructor(renderer: any, shaders: any, options: any);
    items: any;
    samples: any;
    channels: any;
    callback: any;
    update(): void;
    setActive(_i: any, _j: any, _k: any, _l: any): void;
    setCallback(callback: any): void;
    write(): void;
    fill(): void;
    generate(data: any): {
        emit: ((x: any, y: any, z: any, w: any) => void) | undefined;
        consume: ((emit: any) => void) | undefined;
        skip: ((n: any) => void) | undefined;
        count: () => any;
        done: () => boolean;
        reset: () => number;
    };
}
import { Renderable } from "../renderable.js";

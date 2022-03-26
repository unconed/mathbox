export class TextAtlas extends Atlas {
    constructor(renderer: any, shaders: any, options: any);
    font: any;
    size: any;
    style: any;
    variant: any;
    weight: any;
    outline: number;
    gamma: number;
    scratchW: number;
    scratchH: number;
    build(options: any): any;
    canvas: HTMLCanvasElement | undefined;
    context: CanvasRenderingContext2D | null | undefined;
    lineHeight: number | undefined;
    maxWidth: number | undefined;
    colors: string[] | undefined;
    scratch: Uint8Array | undefined;
    _allocate: any;
    _write: any;
    reset(): {};
    mapped: {} | undefined;
    begin(): number[];
    end(): void;
    map(text: any, emit: any): any;
    draw(text: any): number | undefined;
}
import { Atlas } from "./atlas.js";

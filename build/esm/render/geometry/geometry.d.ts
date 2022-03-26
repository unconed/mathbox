export class Geometry {
    uniforms: {};
    groups: any[];
    _reduce(dims: any, maxs: any): any;
    _emitter(name: any): ((a: any, b: any, c: any, d: any) => void) | null;
    _finalize(): void;
    _offsets(offsets: any): void;
}

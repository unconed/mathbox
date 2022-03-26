export class Renderable {
    constructor(renderer: any, shaders: any);
    renderer: any;
    shaders: any;
    gl: any;
    uniforms: {};
    dispose(): void;
    _adopt(uniforms: any): void;
    _set(uniforms: any): void;
}

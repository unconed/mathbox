export class RenderFactory {
    constructor(classes: any, renderer: any, shaders: any);
    classes: any;
    renderer: any;
    shaders: any;
    getTypes(): string[];
    make(type: any, options: any): any;
}

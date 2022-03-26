export class DataTexture {
    constructor(renderer: any, width: any, height: any, channels: any, options: any);
    renderer: any;
    width: any;
    height: any;
    channels: any;
    n: number;
    gl: any;
    minFilter: any;
    magFilter: any;
    type: any;
    ctor: Int8ArrayConstructor | Uint8ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | undefined;
    build(options: any): void;
    texture: any;
    format: any;
    format3: any;
    data: Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | undefined;
    textureObject: any;
    textureProperties: any;
    uniforms: {
        dataResolution: {
            type: string;
            value: any;
        };
        dataTexture: {
            type: string;
            value: any;
        };
    } | undefined;
    write(data: any, x: any, y: any, w: any, h: any): any;
    dispose(): null;
}

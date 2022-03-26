export class BackedTexture extends DataTexture {
    data: Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array;
    resize(width: any, height: any): any;
}
import { DataTexture } from "./datatexture.js";

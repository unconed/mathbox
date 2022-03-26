export class MemoScreen extends Screen {
    memo: any;
    uniforms: {
        remapUVScale: {
            type: string;
            value: any;
        };
        remapModulus: {
            type: string;
            value: any;
        };
        remapModulusInv: {
            type: string;
            value: any;
        };
        remapSTPQScale: {
            type: string;
            value: any;
        };
    };
    cover(width: any, height: any, depth: any, items: any): void;
}
import { Screen } from "./screen.js";

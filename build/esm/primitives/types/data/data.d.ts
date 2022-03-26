export class Data extends Source {
    init(): null;
    dataEmitter: any;
    dataSizes: any[] | null | undefined;
    emitter(channels: any, items: any): any;
    callback(callback: any): any;
    update(): void;
    make(): any;
    first: boolean | undefined;
    unmake(): null;
}
import { Source } from "../base/source.js";

export class Resample extends Operator {
    _resample(dims: any): any;
    make(): boolean | undefined;
    resampled: {} | undefined;
    centered: {} | undefined;
    padding: {} | undefined;
    dataResolution: any;
    dataSize: any;
    targetResolution: any;
    targetSize: any;
    resampleFactor: any;
    resampleBias: any;
    operator: any;
    indexer: any;
    indices: any;
    relativeSample: boolean | undefined;
    relativeSize: boolean | undefined;
    unmake(): null;
    resize(): any;
}
import { Operator } from "./operator.js";

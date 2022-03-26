export class Operator extends Source {
    getDimensions(): any;
    getFutureDimensions(): any;
    getActiveDimensions(): any;
    getIndexDimensions(): any;
    init(): {
        to: string;
        trait: string;
    }[];
    sourceSpec: {
        to: string;
        trait: string;
    }[] | undefined;
    make(): any;
    unmake(): any;
    resize(_rebuild: any): any;
}
import { Source } from "../base/source";

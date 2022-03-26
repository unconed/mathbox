export class Attributes {
    constructor(definitions: any, context: any);
    context: any;
    traits: any;
    types: any;
    pending: any[];
    bound: any[];
    last: any;
    make(type: any): {
        enum: any;
        type: any;
        value: any;
    };
    apply(object: any, config: any): Data;
    bind(callback: any): number;
    unbind(callback: any): any[];
    queue(callback: any, object: any, key: any, value: any): number;
    lastObject: any;
    lastKey: any;
    lastValue: any;
    invoke(callback: any): any;
    compute(): void;
    digest(): boolean;
    getTrait(name: any): any;
    getLastTrigger(): string;
}
declare class Data {
    constructor(object: any, config: any, _attributes: any);
    dispose: () => boolean;
}
export {};

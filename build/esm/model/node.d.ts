export class Node {
    constructor(type: any, defaults: any, options: any, binds: any, config: any, attributes: any);
    type: any;
    _id: string;
    parent: any;
    root: any;
    path: any;
    index: any;
    configure(config: any, attributes: any): any;
    _config: {
        traits: any;
        props: any;
        finals: any;
        freeform: any;
    } | undefined;
    attributes: any;
    dispose(): null;
    _added(parent: any): any;
    _removed(): null;
    _index(index: any, parent: any): any;
    order: number | undefined;
    _encode(path: any): number;
    toString(): string;
    toMarkup(selector: null | undefined, indent: any): any;
    print(selector: any, level: any): any;
}

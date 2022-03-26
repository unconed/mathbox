export class Model {
    constructor(root: any);
    root: any;
    ids: {};
    classes: {};
    traits: {};
    types: {};
    nodes: any[];
    watchers: any[];
    fire: boolean;
    lastNode: any;
    event: {
        type: string;
    };
    digest: () => boolean;
    select(query: any, context: any): any[];
    watch(selector: any, handler: any): any[];
    unwatch(handler: any): boolean | undefined;
    _matcher(query: any): import("css-select/lib/types").CompiledQuery<any> | (() => boolean);
    getRoot(): any;
    getLastTrigger(): any;
}

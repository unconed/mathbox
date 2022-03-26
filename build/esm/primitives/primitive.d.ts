export class Primitive {
    static initClass(): void;
    constructor(node: any, _context: any, helpers: any);
    node: any;
    _context: any;
    _renderables: any;
    _attributes: any;
    _shaders: any;
    _overlays: any;
    _animator: any;
    _types: any;
    _get: any;
    _helpers: any;
    _handlers: {
        inherit: {};
        listen: never[];
        watch: never[];
        compute: never[];
    };
    _root: any;
    _parent: any;
    is(trait: any): any;
    init(): void;
    make(): void;
    made(): void;
    unmake(_rebuild: any): void;
    unmade(): void;
    change(_changed: any, _touched: any, _init: any): void;
    refresh(): void;
    rebuild(): void;
    reconfigure(config: any): any;
    traits: any;
    props: any;
    _added(): void;
    _removed(rebuild: any): void;
    _listen(object: any, type: any, method: any, self: any): any;
    __listen(object: any, type: any, method: any, self: any): any;
    _unlisten(): never[] | undefined;
    _inherit(trait: any): any;
    _find(trait: any): any;
    _uninherit(): {};
    _attach(selector: any, trait: any, method: any, self: any, start: any, optional: any, multiple: any): any;
    _unattach(): never[] | undefined;
    _compute(key: any, expr: any): any;
    _uncompute(): never[] | undefined;
}

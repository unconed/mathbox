export class Controller {
    constructor(model: any, primitives: any);
    model: any;
    primitives: any;
    getRoot(): any;
    getTypes(): any;
    make(type: any, options: any, binds: any): any;
    get(node: any, key: any): any;
    set(node: any, key: any, value: any): any;
    bind(node: any, key: any, expr: any): any;
    unbind(node: any, key: any): any;
    add(node: any, target: any): any;
    remove(node: any): any;
}

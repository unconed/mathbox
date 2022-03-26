export class PrimitiveFactory {
    constructor(definitions: any, context: any);
    context: any;
    classes: any;
    helpers: any;
    getTypes(): string[];
    make(type: any, options: any, binds?: null): any;
}

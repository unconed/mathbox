export class OverlayFactory {
    constructor(classes: any, canvas: any);
    classes: any;
    canvas: any;
    div: HTMLDivElement;
    inject(): any;
    unject(): HTMLDivElement;
    getTypes(): string[];
    make(type: any, options: any): any;
}

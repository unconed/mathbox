export class Overlay {
    constructor(element, options) {
        this.element = element;
        if (typeof this.init === "function") {
            this.init(options);
        }
    }
    dispose() { }
}

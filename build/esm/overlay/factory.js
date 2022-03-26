// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export class OverlayFactory {
    constructor(classes, canvas) {
        this.classes = classes;
        this.canvas = canvas;
        const div = document.createElement("div");
        div.classList.add("mathbox-overlays");
        this.div = div;
    }
    inject() {
        const element = this.canvas.parentNode;
        if (!element) {
            throw new Error("Canvas not inserted into document.");
        }
        return element.insertBefore(this.div, this.canvas);
    }
    unject() {
        const element = this.div.parentNode;
        return element.removeChild(this.div);
    }
    getTypes() {
        return Object.keys(this.classes);
    }
    make(type, options) {
        return new this.classes[type](this.div, options);
    }
}

// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export class Controller {
    constructor(model, primitives) {
        this.model = model;
        this.primitives = primitives;
    }
    getRoot() {
        return this.model.getRoot();
    }
    getTypes() {
        return this.primitives.getTypes();
    }
    make(type, options, binds) {
        return this.primitives.make(type, options, binds);
    }
    get(node, key) {
        return node.get(key);
    }
    set(node, key, value) {
        try {
            return node.set(key, value);
        }
        catch (e) {
            node.print(null, "warn");
            return console.error(e);
        }
    }
    bind(node, key, expr) {
        try {
            return node.bind(key, expr);
        }
        catch (e) {
            node.print(null, "warn");
            return console.error(e);
        }
    }
    unbind(node, key) {
        try {
            return node.unbind(key);
        }
        catch (e) {
            node.print(null, "warn");
            return console.error(e);
        }
    }
    add(node, target) {
        if (target == null) {
            target = this.model.getRoot();
        }
        return target.add(node);
    }
    remove(node) {
        const target = node.parent;
        if (target) {
            return target.remove(node);
        }
    }
}

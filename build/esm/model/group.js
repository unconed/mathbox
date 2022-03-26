// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Node } from "./node.js";
export class Group extends Node {
    constructor(type, defaults, options, binds, config, attributes) {
        super(type, defaults, options, binds, config, attributes);
        this.children = [];
        this.on("reindex", (event) => Array.from(this.children).map((child) => child.trigger(event)));
    }
    add(node) {
        if (node.parent != null) {
            node.parent.remove(node);
        }
        node._index(this.children.length, this);
        this.children.push(node);
        return node._added(this);
    }
    remove(node) {
        if (node.children != null ? node.children.length : undefined) {
            node.empty();
        }
        const index = this.children.indexOf(node);
        if (index === -1) {
            return;
        }
        this.children.splice(index, 1);
        node._index(null);
        node._removed(this);
        for (let i = 0; i < this.children.length; i++) {
            node = this.children[i];
            if (i >= index) {
                node._index(i);
            }
        }
    }
    empty() {
        const children = this.children.slice().reverse();
        for (const node of Array.from(children)) {
            this.remove(node);
        }
    }
}

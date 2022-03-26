// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { compile, selectAll } from "./css-select-adapted";
const AUTO = /^<([0-9]+|<*)$/;
/*
  Model that wraps a root node and its children.

  Monitors adds, removals and ID/class changes.
  Enables CSS selectors, both querying and watching.

  Watchers are primed differentially as changes come in,
  and fired with digest().
*/
export class Model {
    constructor(root) {
        this.root = root;
        this.root.model = this;
        this.root.root = this.root;
        this.ids = {};
        this.classes = {};
        this.traits = {};
        this.types = {};
        this.nodes = [];
        this.watchers = [];
        this.fire = false;
        this.lastNode = null;
        this.event = { type: "update" };
        // Triggered by child addition/removal
        const add = (event) => adopt(event.node);
        const remove = (event) => dispose(event.node);
        this.root.on("add", add);
        this.root.on("remove", remove);
        // Track node lifecycle
        const adopt = (node) => {
            addNode(node);
            addType(node);
            addTraits(node);
            node.on("change:node", update);
            update(null, node, true);
            return force(node);
        };
        const dispose = (node) => {
            removeNode(node);
            removeType(node);
            removeTraits(node);
            removeID(node.id, node);
            removeClasses(node.classes, node);
            node.off("change:node", update);
            return force(node);
        };
        // Watcher cycle for catching changes in id/classes
        const prime = (node) => {
            for (const watcher of Array.from(this.watchers)) {
                watcher.match = watcher.matcher(node);
            }
            return null;
        };
        const check = (node) => {
            for (const watcher of Array.from(this.watchers)) {
                const fire = watcher.fire ||
                    (watcher.fire = watcher.match !== watcher.matcher(node));
                if (fire) {
                    this.lastNode = node;
                }
                if (!this.fire) {
                    this.fire = fire;
                }
            }
            return null;
        };
        const force = (node) => {
            for (const watcher of Array.from(this.watchers)) {
                const fire = watcher.fire || (watcher.fire = watcher.matcher(node));
                if (fire) {
                    this.lastNode = node;
                }
                if (!this.fire) {
                    this.fire = fire;
                }
            }
            return null;
        };
        this.digest = () => {
            if (!this.fire) {
                return false;
            }
            for (const watcher of Array.from(this.watchers.slice())) {
                if (watcher.fire) {
                    watcher.fire = false;
                    watcher.handler();
                }
            }
            this.fire = false;
            return true;
        };
        // Track id/class changes
        const update = (event, node, init) => {
            const _id = init || event.changed["node.id"];
            const _klass = init || event.changed["node.classes"];
            let primed = false;
            if (_id) {
                const id = node.get("node.id");
                if (id !== node.id) {
                    if (!init) {
                        prime(node);
                    }
                    primed = true;
                    if (node.id != null) {
                        removeID(node.id, node);
                    }
                    addID(id, node);
                }
            }
            if (_klass) {
                let left;
                let classes = (left = node.get("node.classes")) != null ? left : [];
                const klass = classes.join(",");
                if (klass !== (node.classes != null ? node.classes.klass : undefined)) {
                    classes = classes.slice();
                    if (!init && !primed) {
                        prime(node);
                    }
                    primed = true;
                    if (node.classes != null) {
                        removeClasses(node.classes, node);
                    }
                    addClasses(classes, node);
                    node.classes = classes;
                    node.classes.klass = klass;
                }
            }
            if (!init && primed) {
                check(node);
            }
            return null;
        };
        // Manage lookup tables for types/classes/traits
        const addTags = function (sets, tags, node) {
            if (tags == null) {
                return;
            }
            for (const k of Array.from(tags)) {
                const list = sets[k] != null ? sets[k] : [];
                list.push(node);
                sets[k] = list;
            }
            return null;
        };
        const removeTags = function (sets, tags, node) {
            if (tags == null) {
                return;
            }
            for (const k of Array.from(tags)) {
                const list = sets[k];
                const index = list.indexOf(node);
                if (index >= 0) {
                    list.splice(index, 1);
                }
                if (list.length === 0) {
                    delete sets[k];
                }
            }
            return null;
        };
        // Build a hash for an array of tags for quick lookups
        const hashTags = function (array) {
            if (!(array.length > 0)) {
                return;
            }
            const hash = (array.hash = {});
            return Array.from(array).map((klass) => (hash[klass] = true));
        };
        const unhashTags = (array) => delete array.hash;
        // Track IDs (live)
        const addID = (id, node) => {
            if (this.ids[id]) {
                throw new Error(`Duplicate node id \`${id}\``);
            }
            if (id != null) {
                this.ids[id] = [node];
            }
            return (node.id = id != null ? id : node._id);
        };
        const removeID = (id, node) => {
            if (id != null) {
                delete this.ids[id];
            }
            return (node.id = node._id);
        };
        // Track classes (live)
        const addClasses = (classes, node) => {
            addTags(this.classes, classes, node);
            if (classes != null) {
                return hashTags(classes);
            }
        };
        const removeClasses = (classes, node) => {
            removeTags(this.classes, classes, node);
            if (classes != null) {
                return unhashTags(classes);
            }
        };
        // Track nodes
        const addNode = (node) => this.nodes.push(node);
        const removeNode = (node) => this.nodes.splice(this.nodes.indexOf(node), 1);
        // Track nodes by type
        const addType = (node) => addTags(this.types, [node.type], node);
        const removeType = (node) => removeTags(this.types, [node.type], node);
        // Track nodes by trait
        const addTraits = (node) => {
            addTags(this.traits, node.traits, node);
            return hashTags(node.traits);
        };
        const removeTraits = (node) => {
            removeTags(this.traits, node.traits, node);
            return unhashTags(node.traits);
        };
        adopt(this.root);
        this.root.trigger({ type: "added" });
    }
    select(query, context) {
        return selectAll(query, context || this.getRoot());
    }
    // Watch selector with handler
    watch(selector, handler) {
        let watcher;
        handler.unwatch = () => this.unwatch(handler);
        handler.watcher = watcher = {
            selector,
            handler,
            matcher: this._matcher(selector),
            match: false,
            fire: false,
        };
        this.watchers.push(watcher);
        return this.select(selector);
    }
    // Unwatch a handler
    unwatch(handler) {
        const { watcher } = handler;
        if (watcher == null) {
            return;
        }
        this.watchers.splice(this.watchers.indexOf(watcher), 1);
        delete handler.unwatch;
        return delete handler.watcher;
    }
    // Make a matcher for a single selector
    _matcher(query) {
        if (AUTO.test(query)) {
            throw new Error("Auto-link matcher unsupported");
        }
        return compile(query);
    }
    getRoot() {
        return this.root;
    }
    getLastTrigger() {
        return this.lastNode.toString();
    }
}

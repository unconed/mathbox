// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Parent } from "../base/parent.js";
export class Present extends Parent {
    static initClass() {
        this.traits = ["node", "present"];
    }
    init() { }
    make() {
        this.nodes = [];
        this.steps = [];
        this.length = 0;
        this.last = [];
        this.index = 0;
        this.dirty = [];
        this._listen("root", "root.update", this.update);
        return this._compute("present.length", () => this.length);
    }
    adopt(controller) {
        const { node } = controller;
        if (this.nodes.indexOf(controller) < 0) {
            this.nodes.push(node);
        }
        return this.dirty.push(controller);
    }
    unadopt(controller) {
        this.nodes = this.nodes.filter((x) => x !== controller);
        return this.dirty.push(controller);
    }
    update() {
        if (!this.dirty.length) {
            return;
        }
        for (const controller of Array.from(this.dirty)) {
            this.slideReset(controller);
        }
        [this.steps, this.indices] = Array.from(this.process(this.nodes));
        this.length = this.steps.length;
        this.index = null;
        this.go(this.props.index);
        return (this.dirty = []);
    }
    slideLatch(controller, enabled, step) {
        return controller.slideLatch(enabled, step);
    }
    slideStep(controller, index, step) {
        return controller.slideStep(this.mapIndex(controller, index), step);
    }
    slideRelease(controller, _step) {
        return controller.slideRelease();
    }
    slideReset(controller) {
        return controller.slideReset();
    }
    mapIndex(controller, index) {
        return index - this.indices[controller.node._id];
    }
    process(nodes) {
        // Grab nodes' path of slide parents
        const slides = (nodes) => Array.from(nodes).map((el) => parents(el).filter(isSlide));
        const traverse = (map) => (el) => (() => {
            let ref, ref1;
            const result = [];
            while (el && (([el, ref] = Array.from((ref1 = [map(el), el]))), ref1)) {
                result.push(ref);
            }
            return result;
        })();
        const parents = traverse(function (el) {
            if (el.parent.traits.hash.present) {
                return null;
            }
            else {
                return el.parent;
            }
        });
        // Helpers
        const isSlide = (el) => nodes.indexOf(el) >= 0;
        // Order paths (leaf -> parent slide -> ...)
        const order = (paths) => paths.sort(function (a, b) {
            // Path lengths
            const c = a.length;
            const d = b.length;
            // Compare from outside in
            let e = Math.min(c, d);
            for (let i = 1, end = e, asc = 1 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
                // inclusive end
                const nodeA = a[c - i];
                const nodeB = b[d - i];
                // Explicit sibling order (natural)
                const f = nodeA.props.order;
                const g = nodeB.props.order;
                if (f != null || g != null) {
                    if (f != null && g != null && (e = f - g) !== 0) {
                        return e;
                    }
                    if (f != null) {
                        return -1;
                    }
                    if (g != null) {
                        return 1;
                    }
                }
                // Document sibling order (inverted)
                if (nodeB.order !== nodeA.order) {
                    return nodeB.order - nodeA.order;
                }
            }
            // Different tree level
            e = c - d;
            if (e !== 0) {
                return e;
            }
            // Equal
            return 0;
        });
        const split = function (steps) {
            const relative = [];
            const absolute = [];
            for (const step of Array.from(steps)) {
                (step[0].props.steps != null ? relative : absolute).push(step);
            }
            return [relative, absolute];
        };
        const expand = function (lists) {
            let step;
            const [relative, absolute] = Array.from(lists);
            const limit = 100;
            const indices = {};
            let steps = [];
            const slide = function (step, index) {
                let node;
                const { props } = (node = step[0]);
                const parent = step[1];
                const parentIndex = parent != null ? indices[parent._id] : 0;
                //throw "parent index missing" if !parentIndex?
                const childIndex = index;
                let from = props.from != null
                    ? parentIndex + props.from
                    : childIndex - props.early;
                let to = props.to != null
                    ? parentIndex + props.to
                    : childIndex + props.steps + props.late;
                from = Math.max(0, from);
                to = Math.min(limit, to);
                if (indices[node._id] == null) {
                    indices[node._id] = from;
                }
                for (let i = from, end = to, asc = from <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                    steps[i] = (steps[i] != null ? steps[i] : (steps[i] = [])).concat(step);
                }
                return props.steps;
            };
            let i = 0;
            for (step of Array.from(relative)) {
                i += slide(step, i);
            }
            for (step of Array.from(absolute)) {
                slide(step, 0);
            }
            // Dedupe and order
            steps = (() => {
                const result = [];
                for (step of Array.from(steps)) {
                    result.push(finalize(dedupe(step)));
                }
                return result;
            })();
            return [steps, indices];
        };
        // Remove duplicates
        const dedupe = function (step) {
            if (step) {
                return (() => {
                    const result = [];
                    for (let i = 0; i < step.length; i++) {
                        const node = step[i];
                        if (step.indexOf(node) === i) {
                            result.push(node);
                        }
                    }
                    return result;
                })();
            }
            else {
                return [];
            }
        };
        // Finalize individual step by document order
        const finalize = (step) => step.sort((a, b) => a.order - b.order);
        const paths = slides(nodes);
        const steps = order(paths);
        return expand(split(steps));
    }
    go(index) {
        // Pad with an empty slide before and after for initial enter/final exit
        let left;
        let node;
        index = Math.max(0, Math.min(this.length + 1, +index || 0));
        const active = (left = this.steps[index - 1]) != null ? left : [];
        const step = this.props.directed ? index - this.index : 1;
        this.index = index;
        const enter = (() => {
            const result = [];
            for (node of Array.from(active)) {
                if (this.last.indexOf(node) < 0) {
                    result.push(node);
                }
            }
            return result;
        })();
        const exit = (() => {
            const result1 = [];
            for (node of Array.from(this.last)) {
                if (active.indexOf(node) < 0) {
                    result1.push(node);
                }
            }
            return result1;
        })();
        const stay = (() => {
            const result2 = [];
            for (node of Array.from(active)) {
                if (enter.indexOf(node) < 0 && exit.indexOf(node) < 0) {
                    result2.push(node);
                }
            }
            return result2;
        })();
        const ascend = (nodes) => nodes.sort((a, b) => a.order - b.order);
        const descend = (nodes) => nodes.sort((a, b) => b.order - a.order);
        //const toStr = (x) => x.toString();
        //console.log '============================================================'
        //console.log 'go',  index, {enter: enter.map(toStr), stay: stay.map(toStr), exit: exit.map(toStr)}
        for (node of Array.from(ascend(enter))) {
            this.slideLatch(node.controller, true, step);
        }
        for (node of Array.from(ascend(stay))) {
            this.slideLatch(node.controller, null, step);
        }
        for (node of Array.from(ascend(exit))) {
            this.slideLatch(node.controller, false, step);
        }
        for (node of Array.from(enter)) {
            this.slideStep(node.controller, index, step);
        }
        for (node of Array.from(stay)) {
            this.slideStep(node.controller, index, step);
        }
        for (node of Array.from(exit)) {
            this.slideStep(node.controller, index, step);
        }
        for (node of Array.from(descend(enter))) {
            this.slideRelease(node.controller);
        }
        for (node of Array.from(descend(stay))) {
            this.slideRelease(node.controller);
        }
        for (node of Array.from(descend(exit))) {
            this.slideRelease(node.controller);
        }
        this.last = active;
    }
    change(changed, touched, init) {
        if (changed["present.index"] || init) {
            return this.go(this.props.index);
        }
    }
}
Present.initClass();

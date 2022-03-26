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
// Quick'n'dirty Virtual DOM diffing
// with a poor man's React for components
//
// This is for rendering HTML with data from a GL readback. See DOM examples.
const HEAP = [];
let id = 0;
// Static render components
export const Types = {
/*
* el('example', props, children);
example: MathBox.DOM.createClass({
  render: (el, props, children) ->
    * VDOM node
    return el('span', { className: "foo" }, "Hello World")
})
*/
};
const descriptor = () => ({
    id: id++,
    type: null,
    props: null,
    children: null,
    rendered: null,
    instance: null,
});
export const hint = function (n) {
    n *= 2;
    n = Math.max(0, HEAP.length - n);
    return __range__(0, n, false).map((_i) => HEAP.push(descriptor()));
};
export const element = function (type, props, children) {
    const el = HEAP.length ? HEAP.pop() : descriptor();
    el.type = type != null ? type : "div";
    el.props = props != null ? props : null;
    el.children = children != null ? children : null;
    // Can't use `arguments` here to pass children as direct args, it de-optimizes label emitters
    return el;
};
export const recycle = function (el) {
    if (!el.type) {
        return;
    }
    const { children } = el;
    el.type = el.props = el.children = el.instance = null;
    HEAP.push(el);
    if (children != null) {
        for (const child of Array.from(children)) {
            recycle(child);
        }
    }
};
export const apply = function (el, last, node, parent, index) {
    if (el != null) {
        if (last == null) {
            // New node
            return mount(el, parent, index);
        }
        else {
            // Literal DOM node
            let same;
            if (el instanceof Node) {
                same = el === last;
                if (same) {
                    return;
                }
            }
            else {
                // Check compatibility
                same =
                    typeof el === typeof last &&
                        last !== null &&
                        el !== null &&
                        el.type === last.type;
            }
            if (!same) {
                // Not compatible: unmount and remount
                unmount(last.instance, node);
                node.remove();
                return mount(el, parent, index);
            }
            else {
                // Maintain component ref
                let key, ref, value;
                el.instance = last.instance;
                // Check if it's a component
                const type = (el.type != null ? el.type.isComponentClass : undefined)
                    ? el.type
                    : Types[el.type];
                // Prepare to diff props and children
                const props = last != null ? last.props : undefined;
                const nextProps = el.props;
                const children = (last != null ? last.children : undefined) != null
                    ? last != null
                        ? last.children
                        : undefined
                    : null;
                const nextChildren = el.children;
                if (nextProps != null) {
                    nextProps.children = nextChildren;
                }
                // Component
                if (type != null) {
                    // See if it changed
                    let dirty = node._COMPONENT_DIRTY;
                    if ((props != null) !== (nextProps != null)) {
                        dirty = true;
                    }
                    if (children !== nextChildren) {
                        dirty = true;
                    }
                    if (props != null && nextProps != null) {
                        if (!dirty) {
                            for (key in props) {
                                if (!Object.prototype.hasOwnProperty.call(nextProps, key)) {
                                    dirty = true;
                                }
                            }
                        }
                        if (!dirty) {
                            for (key in nextProps) {
                                value = nextProps[key];
                                if ((ref = props[key]) !== value) {
                                    dirty = true;
                                }
                            }
                        }
                    }
                    if (dirty) {
                        let left;
                        const comp = last.instance;
                        if (el.props == null) {
                            el.props = {};
                        }
                        for (const k in comp.defaultProps) {
                            const v = comp.defaultProps[k];
                            if (el.props[k] == null) {
                                el.props[k] = v;
                            }
                        }
                        el.props.children = el.children;
                        if (typeof comp.willReceiveProps === "function") {
                            comp.willReceiveProps(el.props);
                        }
                        const should = node._COMPONENT_FORCE ||
                            ((left =
                                typeof comp.shouldUpdate === "function"
                                    ? comp.shouldUpdate(el.props)
                                    : undefined) != null
                                ? left
                                : true);
                        if (should) {
                            const nextState = comp.getNextState();
                            if (typeof comp.willUpdate === "function") {
                                comp.willUpdate(el.props, nextState);
                            }
                        }
                        const prevProps = comp.props;
                        const prevState = comp.applyNextState();
                        comp.props = el.props;
                        comp.children = el.children;
                        if (should) {
                            el = el.rendered =
                                typeof comp.render === "function"
                                    ? comp.render(element, el.props, el.children)
                                    : undefined;
                            apply(el, last.rendered, node, parent, index);
                            if (typeof comp.didUpdate === "function") {
                                comp.didUpdate(prevProps, prevState);
                            }
                        }
                    }
                    return;
                }
                else {
                    // VDOM node
                    if (props != null) {
                        for (key in props) {
                            if (!Object.prototype.hasOwnProperty.call(nextProps, key)) {
                                unset(node, key, props[key]);
                            }
                        }
                    }
                    if (nextProps != null) {
                        for (key in nextProps) {
                            value = nextProps[key];
                            if ((ref = props[key]) !== value && key !== "children") {
                                set(node, key, value, ref);
                            }
                        }
                    }
                    // Diff children
                    if (nextChildren != null) {
                        if (["string", "number"].includes(typeof nextChildren)) {
                            // Insert text directly
                            if (nextChildren !== children) {
                                node.textContent = nextChildren;
                            }
                        }
                        else {
                            if (nextChildren.type != null) {
                                // Single child
                                apply(nextChildren, children, node.childNodes[0], node, 0);
                            }
                            else {
                                // Diff children
                                let child, i;
                                const { childNodes } = node;
                                if (children != null) {
                                    for (i = 0; i < nextChildren.length; i++) {
                                        child = nextChildren[i];
                                        apply(child, children[i], childNodes[i], node, i);
                                    }
                                }
                                else {
                                    for (i = 0; i < nextChildren.length; i++) {
                                        child = nextChildren[i];
                                        apply(child, null, childNodes[i], node, i);
                                    }
                                }
                            }
                        }
                    }
                    else if (children != null) {
                        // Unmount all child components
                        unmount(null, node);
                        // Remove all children
                        node.innerHTML = "";
                    }
                }
                return;
            }
        }
    }
    if (last != null) {
        // Removed node
        unmount(last.instance, node);
        return last.node.remove();
    }
};
const mount = function (el, parent, index) {
    let node;
    if (index == null) {
        index = 0;
    }
    const type = (el.type != null ? el.type.isComponentClass : undefined)
        ? el.type
        : Types[el.type];
    // Literal DOM node
    if (el instanceof Node) {
        node = el;
    }
    else {
        if (type != null) {
            // Component
            let comp;
            const ctor = (el.type != null ? el.type.isComponentClass : undefined)
                ? el.type
                : Types[el.type];
            // No component class found
            if (!ctor) {
                el = el.rendered = element("noscript");
                node = mount(el, parent, index);
                return node;
            }
            // Construct component class
            el.instance = comp = new ctor(parent);
            if (el.props == null) {
                el.props = {};
            }
            for (const k in comp.defaultProps) {
                const v = comp.defaultProps[k];
                if (el.props[k] == null) {
                    el.props[k] = v;
                }
            }
            el.props.children = el.children;
            // Do initial state transition
            comp.props = el.props;
            comp.children = el.children;
            comp.setState(typeof comp.getInitialState === "function"
                ? comp.getInitialState()
                : undefined);
            if (typeof comp.willMount === "function") {
                comp.willMount();
            }
            // Render
            el = el.rendered =
                typeof comp.render === "function"
                    ? comp.render(element, el.props, el.children)
                    : undefined;
            node = mount(el, parent, index);
            // Finish mounting and remember component/node association
            if (typeof comp.didMount === "function") {
                comp.didMount(el);
            }
            node._COMPONENT = comp;
            return node;
        }
        else if (["string", "number"].includes(typeof el)) {
            // Text
            node = document.createTextNode(el);
        }
        else {
            // VDOM Node
            node = document.createElement(el.type);
            for (const key in el.props) {
                const value = el.props[key];
                set(node, key, value);
            }
        }
        const { children } = el;
        if (children != null) {
            if (["string", "number"].includes(typeof children)) {
                // Insert text directly
                node.textContent = children;
            }
            else {
                if (children.type != null) {
                    // Single child
                    mount(children, node, 0);
                }
                else {
                    // Insert children
                    for (let i = 0; i < children.length; i++) {
                        const child = children[i];
                        mount(child, node, i);
                    }
                }
            }
        }
    }
    parent.insertBefore(node, parent.childNodes[index]);
    return node;
};
const unmount = function (comp, node) {
    if (comp) {
        if (typeof comp.willUnmount === "function") {
            comp.willUnmount();
        }
        for (const k in comp) {
            delete comp[k];
        }
    }
    return (() => {
        const result = [];
        for (const child of Array.from(node.childNodes)) {
            unmount(child._COMPONENT, child);
            result.push(delete child._COMPONENT);
        }
        return result;
    })();
};
const prop = function (key) {
    if (typeof document === "undefined") {
        return true;
    }
    if (document.documentElement.style[key] != null) {
        return key;
    }
    key = key[0].toUpperCase() + key.slice(1);
    const prefixes = ["webkit", "moz", "ms", "o"];
    for (const prefix of Array.from(prefixes)) {
        if (document.documentElement.style[prefix + key] != null) {
            return prefix + key;
        }
    }
};
const map = {};
for (const key of ["transform"]) {
    map[key] = prop(key);
}
const set = function (node, key, value, orig) {
    if (key === "style") {
        for (const k in value) {
            const v = value[k];
            if ((orig != null ? orig[k] : undefined) !== v) {
                node.style[map[k] != null ? map[k] : k] = v;
            }
        }
        return;
    }
    if (node[key] != null) {
        try {
            node[key] = value;
        }
        catch (e1) {
            console.log("failed setting " + key);
        }
        return;
    }
    if (node instanceof Node) {
        node.setAttribute(key, value);
        return;
    }
};
const unset = function (node, key, orig) {
    if (key === "style") {
        for (const k in orig) {
            node.style[map[k] != null ? map[k] : k] = "";
        }
        return;
    }
    if (node[key] != null) {
        node[key] = undefined;
    }
    if (node instanceof Node) {
        node.removeAttribute(key);
        return;
    }
};
/**
 * This needs explicit any -> any typings for ts to emit declarations.
 * Typescript can't handle class declarations inside functions very well.
 *
 * @param {any} prototype
 * @returns {any}
 */
export const createClass = function (prototype) {
    let left;
    const aliases = {
        willMount: "componentWillMount",
        didMount: "componentDidMount",
        willReceiveProps: "componentWillReceiveProps",
        shouldUpdate: "shouldComponentUpdate",
        willUpdate: "componentWillUpdate",
        didUpdate: "componentDidUpdate",
        willUnmount: "componentWillUnmount",
    };
    for (const a in aliases) {
        const b = aliases[a];
        if (prototype[a] == null) {
            prototype[a] = prototype[b];
        }
    }
    class Component {
        constructor(node, props, state = null, children = null) {
            let k, v;
            if (props == null) {
                props = {};
            }
            this.props = props;
            this.state = state;
            this.children = children;
            const bind = function (f, self) {
                if (typeof f === "function") {
                    return f.bind(self);
                }
                else {
                    return f;
                }
            };
            for (k in prototype) {
                v = prototype[k];
                this[k] = bind(v, this);
            }
            let nextState = null;
            this.setState = function (state) {
                if (nextState == null) {
                    nextState = state ? (nextState != null ? nextState : {}) : null;
                }
                for (k in state) {
                    v = state[k];
                    nextState[k] = v;
                }
                node._COMPONENT_DIRTY = true;
            };
            this.forceUpdate = function () {
                node._COMPONENT_FORCE = node._COMPONENT_DIRTY = true;
                let el = node;
                return (() => {
                    const result = [];
                    while ((el = el.parentNode)) {
                        if (el._COMPONENT) {
                            result.push((el._COMPONENT_FORCE = true));
                        }
                        else {
                            result.push(undefined);
                        }
                    }
                    return result;
                })();
            };
            this.getNextState = () => nextState;
            this.applyNextState = function () {
                node._COMPONENT_FORCE = node._COMPONENT_DIRTY = false;
                const prevState = this.state;
                [nextState, this.state] = Array.from([null, nextState]);
                return prevState;
            };
        }
    }
    Component.isComponentClass = true;
    Component.prototype.defaultProps =
        (left =
            typeof prototype.getDefaultProps === "function"
                ? prototype.getDefaultProps()
                : undefined) != null
            ? left
            : {};
    return Component;
};
function __range__(left, right, inclusive) {
    const range = [];
    const ascending = left < right;
    const end = !inclusive ? right : ascending ? right + 1 : right - 1;
    for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
    }
    return range;
}

/**
 * This file contains an *adapter* for css-select. css-select is a CSS selection
 * engine for HTML that can be used with other data structures (XML, etc) via
 * adapters. Here we define an adapter for MathBox's vdom.
 *
 * The adapter interface is described here:
 *    https://github.com/fb55/css-select/blob/1aa44bdd64aaf2ebdfd7f338e2e76bed36521957/src/types.ts#L6-L96
 *
 * Nodes vs Elements:
 * In general, CSS Selectors act on a document tree built from nodes, which can
 * include element nodes and non-element nodes. For example, in HTML, tags are
 * element nodes but lines of text are non-element node. Non-element text nodes
 * can influence css selection, e.g., via :first-line pseudoclass, but these
 * non-element nodes are never returned by selectors.
 *
 * Mathbox only has element nodes.
 */
/**
 * Is this node an element node? Yes. Mathbox only has element nodes.
 */
function isTag(_elem) {
    return true;
}
function getChildren(elem) {
    return elem.children || [];
}
function getParent(elem) {
    return elem.parent;
}
/**
 * Takes an array of nodes, and removes any duplicates, as well as any
 * nodes whose ancestors are also in the array.
 */
function removeSubsets(nodes) {
    const deduped = new Set(nodes);
    deduped.forEach((node) => {
        let ancestor = node.parent;
        while (ancestor) {
            if (deduped.has(ancestor)) {
                deduped.delete(node);
                return;
            }
            ancestor = ancestor.parent;
        }
    });
    return Array.from(deduped);
}
const adapter = {
    isTag,
    /**
     * Does at least one of passed element nodes pass the test predicate?
     */
    existsOne(test, elems) {
        return elems.some((elem) => isTag(elem)
            ? test(elem) || adapter.existsOne(test, getChildren(elem))
            : false);
    },
    /**
     * Get the siblings of the node. Note that unlike jQuery's `siblings` method,
     * this is expected to include the current node as well
     */
    getSiblings(elem) {
        const parent = getParent(elem);
        return parent ? getChildren(parent) : [elem];
    },
    getChildren,
    getParent,
    getAttributeValue(elem, name) {
        if (name === "class")
            return elem.props.classes.join(" ");
        if (name === "id")
            return elem.id;
        return "";
    },
    hasAttrib(elem, name) {
        if (name === "id")
            return !!elem.id;
        if (name === "class")
            return elem.props.classes.length > 0;
        if (!elem.traits.hash)
            return false;
        return Object.prototype.hasOwnProperty.call(elem.traits.hash, name);
    },
    removeSubsets,
    getName(elem) {
        var _a;
        return (_a = elem.type) !== null && _a !== void 0 ? _a : "";
    },
    /**
     * Finds the first node in the array that matches the test predicate, or one
     * of its children.
     */
    findOne: function findOne(test, elems) {
        for (const node of elems) {
            if (test(node)) {
                return node;
            }
            else {
                const match = findOne(test, getChildren(node));
                if (match)
                    return match;
            }
        }
        return null;
    },
    findAll: function findAll(test, elems) {
        const result = [];
        for (const elem of elems) {
            if (!isTag(elem))
                continue;
            if (test(elem)) {
                result.push(elem);
            }
            result.push(...findAll(test, getChildren(elem)));
        }
        return result;
    },
    getText: function getText(_elem) {
        return "";
    },
};
export default adapter;

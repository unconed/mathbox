export default adapter;
declare namespace adapter {
    export { isTag };
    /**
     * Does at least one of passed element nodes pass the test predicate?
     */
    export function existsOne(test: any, elems: any): any;
    /**
     * Does at least one of passed element nodes pass the test predicate?
     */
    export function existsOne(test: any, elems: any): any;
    /**
     * Get the siblings of the node. Note that unlike jQuery's `siblings` method,
     * this is expected to include the current node as well
     */
    export function getSiblings(elem: any): any;
    /**
     * Get the siblings of the node. Note that unlike jQuery's `siblings` method,
     * this is expected to include the current node as well
     */
    export function getSiblings(elem: any): any;
    export { getChildren };
    export { getParent };
    export function getAttributeValue(elem: any, name: any): any;
    export function getAttributeValue(elem: any, name: any): any;
    export function hasAttrib(elem: any, name: any): any;
    export function hasAttrib(elem: any, name: any): any;
    export { removeSubsets };
    export function getName(elem: any): any;
    export function getName(elem: any): any;
    export function findOne(test: any, elems: any): any;
    export function findAll(test: any, elems: any): any;
    export function getText(_elem: any): string;
}
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
declare function isTag(_elem: any): boolean;
declare function getChildren(elem: any): any;
declare function getParent(elem: any): any;
/**
 * Takes an array of nodes, and removes any duplicates, as well as any
 * nodes whose ancestors are also in the array.
 */
declare function removeSubsets(nodes: any): any[];

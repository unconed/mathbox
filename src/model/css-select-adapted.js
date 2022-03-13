import * as CSSselect from "css-select";
import adapter from "./css-select-adapter.js";

/**
 * Returns a filtered array of elements which are contained in context.
 */
const filter = (nodes, context) => {
  const out = [];
  const contextNodes = Array.isArray(context) ? context : [context];
  const contextSet = new Set(contextNodes);
  for (const node of Array.from(nodes)) {
    let ancestor = node;
    while (ancestor != null) {
      if (contextSet.has(ancestor)) {
        out.push(node);
        break;
      }
      ancestor = adapter.getParent(ancestor);
    }
  }
  return out;
};

const getRoot = (element) => {
  let ancestor = element;
  while (adapter.getParent(ancestor) !== null) {
    ancestor = adapter.getParent(ancestor);
  }
  return ancestor;
};

/**
 * Finds elements in the given context matching the given css-selector.
 *
 * Does NOT throw if css query is invalid.
 *
 * @param {string} query A css selector
 * @param {*} context Element or array of elements
 * @returns All elements in context matching query
 */
export const selectAll = (query, context) => {
  try {
    /**
     * Try/catch to tolerate invalid css queries.
     * See https://gitgud.io/unconed/mathbox/-/issues/23
     */
    CSSselect.compile(query);
  } catch (err) {
    return [];
  }

  /**
   * Delegate to css-select, except always make queries relative to root and
   * filter matches outside of context ourselves. css-select does not currently
   * handle contextualized queries relative to root correctly.
   *
   * See https://github.com/fb55/css-select/issues/709
   */

  const isArray = Array.isArray(context);
  if (isArray && context.length === 0) return [];
  const root = getRoot(isArray ? context[0] : context);
  const matches = CSSselect.selectAll(query, root, { adapter });
  if (context) return filter(matches, context);
  return matches;
};

export const compile = (query) => {
  try {
    /**
     * Try/catch to tolerate invalid css queries.
     * See https://gitgud.io/unconed/mathbox/-/issues/23
     */
    return CSSselect.compile(query, { adapter });
  } catch (err) {
    return () => false;
  }
};

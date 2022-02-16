// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as ShaderGraph from "shadergraph";

export const Factory = function (snippets) {
  function fetch(name) {
    // Built-in library
    const s = snippets[name];
    if (s != null) {
      return s;
    }

    // Load from <script> tags by ID
    const ref = ["#", ".", ":", "["].includes(name[0]);
    const sel = ref ? name : `#${name}`;
    const element = document.querySelector(sel);
    if (element != null && element.tagName === "SCRIPT") {
      return element.textContent || element.innerText;
    }

    throw new Error(`Unknown shader \`${name}\``);
  }

  return ShaderGraph.load(fetch, { autoInspect: true });
};

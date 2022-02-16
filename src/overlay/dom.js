// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as VDOM from "../util/vdom.js";
import { Overlay } from "./overlay.js";

export class DOM extends Overlay {
  static initClass() {
    this.prototype.el = VDOM.element;
    this.prototype.hint = VDOM.hint;
    this.prototype.apply = VDOM.apply;
    this.prototype.recycle = VDOM.recycle;
  }

  init(_options) {
    return (this.last = null);
  }

  dispose() {
    this.unmount();
    return super.dispose();
  }

  mount() {
    const overlay = document.createElement("div");
    overlay.classList.add("mathbox-overlay");
    this.element.appendChild(overlay);
    return (this.overlay = overlay);
  }

  unmount(_overlay) {
    if (this.overlay.parentNode) {
      this.element.removeChild(this.overlay);
    }
    return (this.overlay = null);
  }

  render(el) {
    // Lazy mounting
    if (!this.overlay) {
      this.mount();
    }

    // Wrap naked string or array in a div
    if (["string", "number"].includes(typeof el)) {
      el = this.el("div", null, el);
    }
    if (el instanceof Array) {
      el = this.el("div", null, el);
    }

    // See if it can be mounted directly
    const naked = el.type === "div";

    // Fetch last DOM state
    let { last } = this;

    // Start with root node
    const { overlay } = this;
    const node = naked ? overlay : overlay.childNodes[0];
    const parent = naked ? overlay.parentNode : overlay;

    // Create phantom DOM state if mounting into existing element
    if (!last && node) {
      last = this.el("div");
    }

    // Update DOM
    this.apply(el, last, node, parent, 0);
    this.last = el;

    // Recycle old descriptors
    if (last != null) {
      this.recycle(last);
    }
  }
}
DOM.initClass();

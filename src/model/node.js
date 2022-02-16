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

import * as Pretty from "../util/pretty.js";
import { Binder } from "threestrap/src/binder.js";

let nodeIndex = 0;

export class Node {
  constructor(type, defaults, options, binds, config, attributes) {
    this.type = type;
    this._id = (++nodeIndex).toString();

    this.configure(config, attributes);
    this.parent = this.root = this.path = this.index = null;

    this.set(defaults, true, true);
    this.set(options, false, true);
    this.bind(binds, false);
  }

  configure(config, attributes) {
    let { traits, props, finals, freeform } = config;
    if (traits == null) {
      traits =
        (this._config != null ? this._config.traits : undefined) != null
          ? this._config != null
            ? this._config.traits
            : undefined
          : [];
    }
    if (props == null) {
      props =
        (this._config != null ? this._config.props : undefined) != null
          ? this._config != null
            ? this._config.props
            : undefined
          : {};
    }
    if (finals == null) {
      finals =
        (this._config != null ? this._config.finals : undefined) != null
          ? this._config != null
            ? this._config.finals
            : undefined
          : {};
    }
    if (freeform == null) {
      freeform =
        (this._config != null ? this._config.freeform : undefined) != null
          ? this._config != null
            ? this._config.freeform
            : undefined
          : false;
    }

    this._config = { traits, props, finals, freeform };
    return (this.attributes = attributes.apply(this, this._config));
  }

  dispose() {
    this.attributes.dispose();
    return (this.attributes = null);
  }

  // Add/removal callback
  _added(parent) {
    this.parent = parent;
    this.root = parent.root;

    // Notify root listeners of child addition
    const event = {
      type: "add",
      node: this,
      parent: this.parent,
    };
    if (this.root) {
      this.root.trigger(event);
    }

    // Notify self listeners of own addition
    event.type = "added";
    return this.trigger(event);
  }

  _removed() {
    // Notify root listeners of child removal
    const event = {
      type: "remove",
      node: this,
    };
    if (this.root) {
      this.root.trigger(event);
    }

    // Notify self listeners of own removal
    event.type = "removed";
    this.trigger(event);

    return (this.root = this.parent = null);
  }

  // Assign unique indices to nodes to make paths
  _index(index, parent) {
    let path;
    if (parent == null) {
      ({ parent } = this);
    }
    this.index = index;
    this.path = path =
      index != null
        ? ((parent != null ? parent.path : undefined) != null
            ? parent != null
              ? parent.path
              : undefined
            : []
          ).concat([index])
        : null;
    this.order = path != null ? this._encode(path) : Infinity;
    if (this.root != null) {
      return this.trigger({ type: "reindex" });
    }
  }

  // Asymptotic arithmetic encoding
  // Computes invariant node order from path of indices
  // Goes from 1 at the root [0] of the tree, to 0 at [∞] (best for FP precision).
  // Divides the interval into countably infinite many intervals, nested recursively.
  //
  // (loses precision eventually, it's used cos three.js needs a single numerical order)
  _encode(path) {
    // Tune precision between deep and narrow (1) vs shallow and wide (n)
    const k = 3;

    const map = (x) => k / (x + k);
    const lerp = (t) => b + (a - b) * t;

    var a = 1 + 1 / k;
    var b = 0;
    for (let index of Array.from(path)) {
      const f = map(index + 1);
      const g = map(index + 2);
      [a, b] = Array.from([lerp(f), lerp(g)]);
    }
    return a;
  }

  toString() {
    const _id = this.id != null ? this.id : this._id;

    const tag = this.type != null ? this.type : "node";
    let id = tag;
    id += `#${_id}`;
    if (this.classes != null ? this.classes.length : undefined) {
      id += `.${this.classes.join(".")}`;
    }

    if (this.children != null) {
      let count;
      if ((count = this.children.length)) {
        return `<${id}>…(${count})…</${tag}>`;
      } else {
        return `<${id}></${tag}>`;
      }
    } else {
      return `<${id} />`;
    }
  }

  toMarkup(selector = null, indent) {
    let k, v;
    if (indent == null) {
      indent = "";
    }
    if (selector && typeof selector !== "function") {
      let left;
      selector =
        (left =
          this.root != null ? this.root.model._matcher(selector) : undefined) !=
        null
          ? left
          : () => true;
    }

    const tag = this.type != null ? this.type : "node";
    let { expr } = this;

    // Ensure generated ID goes first
    const orig = { id: this._id };
    const object = typeof this.orig === "function" ? this.orig() : undefined;
    for (k in object) {
      v = object[k];
      orig[k] = v;
    }

    const props = (() => {
      const result = [];
      for (k in orig) {
        v = orig[k];
        if (!this.expr[k]) {
          result.push(Pretty.JSX.prop(k, v));
        }
      }
      return result;
    })();
    expr = (() => {
      const result1 = [];
      for (k in expr) {
        v = expr[k];
        result1.push(Pretty.JSX.bind(k, v));
      }
      return result1;
    })();

    let attr = [""];
    if (props.length) {
      attr = attr.concat(props);
    }
    if (expr.length) {
      attr = attr.concat(expr);
    }
    attr = attr.join(" ");

    let child = indent;
    const recurse = () => {
      if (!(this.children != null ? this.children.length : undefined)) {
        return "";
      }
      return this.children
        .map((x) => x.toMarkup(selector, child))
        .filter((x) => x != null && x.length)
        .join("\n");
    };

    if (selector && !selector(this)) {
      return recurse();
    }

    if (this.children != null) {
      const open = `<${tag}${attr}>`;
      const close = `</${tag}>`;

      child = indent + "  ";
      let children = recurse();
      if (children.length) {
        children = "\n" + children + "\n" + indent;
      }
      if (children == null) {
        children = "";
      }

      return indent + open + children + close;
    } else {
      return `${indent}<${tag}${attr} />`;
    }
  }

  print(selector, level) {
    return Pretty.print(this.toMarkup(selector), level);
  }
}

Binder.apply(Node.prototype);

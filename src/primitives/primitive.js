// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as Model from "../model";
import { Binder } from "threestrap/src/binder.js";

export class Primitive {
  static initClass() {
    this.Node = Model.Node;
    this.Group = Model.Group;

    // Class default
    this.model = this.Node;
    this.defaults = null;
    this.traits = null;
    this.props = null;
    this.finals = null;
    this.freeform = false;
  }

  constructor(node, _context, helpers) {
    this.node = node;
    this._context = _context;
    this._renderables = this._context.renderables;
    this._attributes = this._context.attributes;
    this._shaders = this._context.shaders;
    this._overlays = this._context.overlays;
    this._animator = this._context.animator;
    this._types = this._attributes.types;

    // Link up node 1-to-1
    this.node.controller = this;

    // This node has been inserted/removed
    this.node.on("added", (_event) => this._added());
    this.node.on("removed", (_event) => this._removed());

    // Property change (if mounted)
    this.node.on("change", (event) => {
      if (this._root) {
        return this.change(event.changed, event.touched);
      }
    });

    // Store local refs
    this.reconfigure();

    // Attribute getter / helpers
    this._get = this.node.get.bind(this.node);
    this._helpers = helpers(this, this.node.traits);

    // Keep track of various handlers to do auto-cleanup on unmake()
    this._handlers = { inherit: {}, listen: [], watch: [], compute: [] };

    // Detached initially
    this._root = this._parent = null;

    // Friendly constructor
    this.init();
  }

  is(trait) {
    return this.traits.hash[trait];
  }

  // Primitive lifecycle
  init() {}
  make() {}
  made() {}
  unmake(_rebuild) {}
  unmade() {}
  change(_changed, _touched, _init) {}

  // Force property reinit
  refresh() {
    return this.change({}, {}, true);
  }

  // Destroy and create cycle
  rebuild() {
    if (this._root) {
      this._removed(true);
      return this._added();
    }
  }

  // Reconfigure traits/props
  reconfigure(config) {
    if (config != null) {
      this.node.configure(config, this._attributes);
    }

    this.traits = this.node.traits;
    return (this.props = this.node.props);
  }

  // This node has been inserted
  _added() {
    let e, left;
    this._parent =
      this.node.parent != null ? this.node.parent.controller : undefined;
    this._root = this.node.root != null ? this.node.root.controller : undefined;

    this.node.clock =
      (left = this._inherit("clock")) != null ? left : this._root;

    try {
      try {
        this.make();
        this.refresh();
        return this.made();
      } catch (error) {
        e = error;
        this.node.print("warn");
        console.error(e);
        throw e;
      }
    } catch (error1) {
      e = error1;
      try {
        return this._removed();
        // eslint-disable-next-line no-empty
      } catch (error2) {}
    }
  }

  _removed(rebuild) {
    if (rebuild == null) {
      rebuild = false;
    }
    this.unmake(rebuild);

    this._unlisten();
    this._unattach();
    this._uncompute();

    this._root = null;
    this._parent = null;

    return this.unmade(rebuild);
  }

  // Bind event listeners to methods
  _listen(object, type, method, self) {
    if (self == null) {
      self = this;
    }
    if (object instanceof Array) {
      for (const o of Array.from(object)) {
        return this.__listen(o, type, method, self);
      }
    }
    return this.__listen(object, type, method, self);
  }

  __listen(object, type, method, self) {
    if (self == null) {
      self = this;
    }
    if (typeof object === "string") {
      object = this._inherit(object);
    }

    if (object != null) {
      const handler = method.bind(self);
      handler.node = this.node;
      object.on(type, handler);

      this._handlers.listen.push([object, type, handler]);
    }
    return object;
  }

  _unlisten() {
    if (!this._handlers.listen.length) {
      return;
    }

    for (const [object, type, handler] of Array.from(this._handlers.listen)) {
      object.off(type, handler);
    }
    return (this._handlers.listen = []);
  }

  // Find parent with certain trait
  _inherit(trait) {
    const cached = this._handlers.inherit[trait];
    if (cached !== undefined) {
      return cached;
    }

    return (this._handlers.inherit[trait] =
      this._parent != null
        ? this._parent._find(trait != null ? trait : null)
        : undefined);
  }

  _find(trait) {
    if (this.is(trait)) {
      return this;
    }
    return this._parent != null ? this._parent._find(trait) : undefined;
  }

  _uninherit() {
    return (this._handlers.inherit = {});
  }

  // Attach to controller by trait and watch the selector
  _attach(selector, trait, method, self, start, optional, multiple) {
    if (self == null) {
      self = this;
    }
    if (start == null) {
      start = this;
    }
    if (optional == null) {
      optional = false;
    }
    if (multiple == null) {
      multiple = false;
    }
    const filter = function (node) {
      if (node != null && Array.from(node.traits).includes(trait)) {
        return node;
      }
    };
    const map = (node) => (node != null ? node.controller : undefined);
    const flatten = function (list) {
      if (list == null) {
        return list;
      }
      let out = [];
      for (const sub of Array.from(list)) {
        if (sub instanceof Array) {
          out = out.concat(sub);
        } else {
          out.push(sub);
        }
      }
      return out;
    };

    const resolve = (selector) => {
      // Direct JS binding, no watcher.
      let node, nodes;
      if (typeof selector === "object") {
        node = selector;

        // API object
        if (node != null ? node._up : undefined) {
          selector = multiple ? node._targets : [node[0]];
          return selector;
        }

        // Array of things
        if (node instanceof Array) {
          selector = multiple ? flatten(node.map(resolve)) : resolve(node[0]);
          return selector;
        }

        // Node
        if (node instanceof Model.Node) {
          return [node];
        }

        // Auto-link selector '<'
      } else if (typeof selector === "string" && selector[0] === "<") {
        let match;
        let discard = 0;
        if ((match = selector.match(/^<([0-9])+$/))) {
          discard = +match[1] - 1;
        }
        if (selector.match(/^<+$/)) {
          discard = +selector.length - 1;
        }

        nodes = [];

        // Implicitly associated node (scan backwards until we find one)
        let previous = start.node;
        while (previous) {
          // Find previous node
          const { parent } = previous;
          if (!parent) {
            break;
          }
          previous = parent.children[previous.index - 1];

          // If we reached the first child, ascend if nothing found yet
          if (!previous && !nodes.length) {
            previous = parent;
          }

          // Include if matched
          node = null;
          if (filter(previous)) {
            node = previous;
          }
          if (node != null && discard-- <= 0) {
            nodes.push(node);
          }

          // Return solo match
          if (!multiple && nodes.length) {
            return nodes;
          }
        }

        // Return list match
        if (multiple && nodes.length) {
          return nodes;
        }

        // Selector binding
      } else if (typeof selector === "string") {
        const watcher = method.bind(self);
        this._handlers.watch.push(watcher);

        const selection = this._root.watch(selector, watcher);
        if (!multiple) {
          if (filter(selection[0])) {
            node = selection[0];
          }
          if (node != null) {
            return [node];
          }
        } else {
          nodes = selection.filter(filter);
          if (nodes.length) {
            return nodes;
          }
        }
      }

      // Nothing found
      if (!optional) {
        console.warn(this.node.toMarkup());
        throw new Error(
          `${this.node.toString()} - Could not find ${trait} \`${selector}\``
        );
      }
      if (multiple) {
        return [];
      } else {
        return null;
      }
    };

    // Resolve selection recursively
    const nodes = flatten(resolve(selector));

    // Return node's controllers if found
    if (multiple) {
      if (nodes != null) {
        return nodes.map(map);
      } else {
        return null;
      }
    } else {
      if (nodes != null) {
        return map(nodes[0]);
      } else {
        return null;
      }
    }
  }

  // Remove watcher attachments
  _unattach() {
    if (!this._handlers.watch.length) {
      return;
    }

    for (const watcher of Array.from(this._handlers.watch)) {
      if (watcher != null) {
        watcher.unwatch();
      }
    }
    return (this._handlers.watch = []);
  }

  // Bind a computed value to a prop
  _compute(key, expr) {
    this._handlers.compute.push(key);
    return this.node.bind(key, expr, true);
  }

  // Remove prop bindings
  _uncompute() {
    if (!this._handlers.compute.length) {
      return;
    }
    for (const key of Array.from(this._handlers.compute)) {
      this.node.unbind(key, true);
    }
    return (this._handlers.compute = []);
  }
}
Primitive.initClass();

Binder.apply(Primitive.prototype);

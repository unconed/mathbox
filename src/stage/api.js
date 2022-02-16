// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as Pretty from "../util/pretty.js";
import * as ShaderGraph from "shadergraph";

export class API {
  v2() {
    return this;
  }

  constructor(_context, _up, _targets) {
    this._context = _context;
    this._up = _up;
    this._targets = _targets;
    const root = this._context.controller.getRoot();

    if (this._targets == null) {
      this._targets = [root];
    }
    this.isRoot = this._targets.length === 1 && this._targets[0] === root;
    this.isLeaf =
      this._targets.length === 1 && this._targets[0].children == null;

    // Look like an array
    for (let i = 0; i < this._targets.length; i++) {
      const t = this._targets[i];
      this[i] = t;
    }
    this.length = this._targets.length;

    // Primitive factory. This is where all API methods are assigned.
    for (let type of Array.from(this._context.controller.getTypes())) {
      if (!["root"].includes(type)) {
        this[type] = (options, binds) => this.add(type, options, binds);
      }
    }
  }

  select(selector) {
    const targets = this._context.model.select(
      selector,
      !this.isRoot ? this._targets : null
    );
    return this._push(targets);
  }

  eq(index) {
    if (this._targets.length > index) {
      return this._push([this._targets[index]]);
    }
    return this._push([]);
  }

  filter(callback) {
    if (typeof callback === "string") {
      const matcher = this._context.model._matcher(callback);
      callback = (x) => matcher(x);
    }

    return this._push(this._targets.filter(callback));
  }

  map(callback) {
    return __range__(0, this.length, false).map((i) =>
      callback(this[i], i, this)
    );
  }

  each(callback) {
    for (
      let i = 0, end = this.length, asc = 0 <= end;
      asc ? i < end : i > end;
      asc ? i++ : i--
    ) {
      callback(this[i], i, this);
    }
    return this;
  }

  add(type, options, binds) {
    // Make node/primitive
    const { controller } = this._context;

    // Auto-pop if targeting leaf
    if (this.isLeaf) {
      return this._pop().add(type, options, binds);
    }

    // Add to target
    const nodes = [];
    for (let target of this._targets) {
      const node = controller.make(type, options, binds);
      controller.add(node, target);
      nodes.push(node);
    }

    // Return changed selection
    return this._push(nodes);
  }

  remove(selector) {
    if (selector) {
      return this.select(selector).remove();
    }
    for (let target of Array.from(this._targets.slice().reverse())) {
      this._context.controller.remove(target);
    }
    return this._pop();
  }

  set(key, value) {
    for (let target of Array.from(this._targets)) {
      this._context.controller.set(target, key, value);
    }
    return this;
  }

  getAll(key) {
    return Array.from(this._targets).map((target) =>
      this._context.controller.get(target, key)
    );
  }

  get(key) {
    return this._targets[0] != null ? this._targets[0].get(key) : undefined;
  }

  evaluate(key, time) {
    return this._targets[0] != null
      ? this._targets[0].evaluate(key, time)
      : undefined;
  }

  bind(key, value) {
    for (let target of Array.from(this._targets)) {
      this._context.controller.bind(target, key, value);
    }
    return this;
  }

  unbind(key) {
    for (let target of Array.from(this._targets)) {
      this._context.controller.unbind(target, key);
    }
    return this;
  }

  end() {
    return (this.isLeaf ? this._pop() : this)._pop();
  }

  _push(targets) {
    return new API(this._context, this, targets);
  }
  _pop() {
    return this._up != null ? this._up : this;
  }
  _reset() {
    let left;
    return (left = this._up != null ? this._up.reset() : undefined) != null
      ? left
      : this;
  }

  // TODO is this okay??
  // eslint-disable-next-line no-dupe-class-members
  map(callback) {
    return this._targets.map(callback);
  }

  on() {
    const args = arguments;
    this._targets.map((x) => x.on.apply(x, args));
    return this;
  }

  off() {
    const args = arguments;
    this._targets.map((x) => x.on.apply(x, args));
    return this;
  }

  toString() {
    const tags = this._targets.map((x) => x.toString());
    if (this._targets.length > 1) {
      return `[${tags.join(", ")}]`;
    } else {
      return tags[0];
    }
  }

  toMarkup() {
    const tags = this._targets.map((x) => x.toMarkup());
    return tags.join("\n\n");
  }

  print() {
    Pretty.print(this._targets.map((x) => x.toMarkup()).join("\n\n"));
    return this;
  }

  debug() {
    const info = this.inspect();
    console.log("Renderables: ", info.renderables);
    console.log("Renders: ", info.renders);
    console.log("Shaders: ", info.shaders);

    const getName = (owner) =>
      owner.constructor.toString().match("function +([^(]*)")[1];

    const shaders = [];
    for (let shader of Array.from(info.shaders)) {
      const name = getName(shader.owner);
      shaders.push(`${name} - Vertex`);
      shaders.push(shader.vertex);
      shaders.push(`${name} - Fragment`);
      shaders.push(shader.fragment);
    }
    return ShaderGraph.inspect(shaders);
  }

  inspect(selector, trait, print) {
    let self;
    if (typeof trait === "boolean") {
      print = trait;
      trait = null;
    }
    if (print == null) {
      print = true;
    }

    // Recurse tree and extract all inserted renderables
    const map = (node) =>
      (node.controller != null ? node.controller.objects : undefined) != null
        ? node.controller != null
          ? node.controller.objects
          : undefined
        : [];
    const recurse = (self = function (node, list) {
      if (list == null) {
        list = [];
      }
      if (!trait || node.traits.hash[trait]) {
        list.push(map(node));
      }
      if (node.children != null) {
        for (let child of Array.from(node.children)) {
          self(child, list);
        }
      }
      return list;
    });

    // Flatten arrays
    const flatten = function (list) {
      list = list.reduce((a, b) => a.concat(b), []);
      return (list = list.filter((x, i) => x != null && list.indexOf(x) === i));
    };

    // Render descriptor
    const make = function (renderable, render) {
      const d = {};
      d.owner = renderable;
      d.geometry = render.geometry;
      d.material = render.material;
      d.vertex = render.userData.vertexGraph;
      d.fragment = render.userData.fragmentGraph;
      return d;
    };

    const info = {
      nodes: this._targets.slice(),
      renderables: [],
      renders: [],
      shaders: [],
    };

    // Inspect all targets
    for (let target of Array.from(this._targets)) {
      var renderables;
      if (print) {
        target.print(selector, "info");
      }

      const _info = {
        renderables: (renderables = flatten(recurse(target))),
        renders: flatten(renderables.map((x) => x.renders)),
        shaders: flatten(
          renderables.map((x) =>
            x.renders != null ? x.renders.map((r) => make(x, r)) : undefined
          )
        ),
      };

      for (let k in _info) {
        info[k] = info[k].concat(_info[k]);
      }
    }

    return info;
  }
}

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}

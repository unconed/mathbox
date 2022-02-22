// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

const cssauron = require("@sicmutils/cssauron");

const ALL = "*";
const ID = /^#([A-Za-z0-9_])$/;
const CLASS = /^\.([A-Za-z0-9_]+)$/;
const TRAIT = /^\[([A-Za-z0-9_]+)\]$/;
const TYPE = /^[A-Za-z0-9_]+$/;
const AUTO = /^<([0-9]+|<*)$/;

// Lazy load CSSauron
let language = null;

/*
  Model that wraps a root node and its children.

  Monitors adds, removals and ID/class changes.
  Enables CSS selectors, both querying and watching.

  Watchers are primed differentially as changes come in,
  and fired with digest().
*/
export class Model {
  constructor(root) {
    this.root = root;
    this.root.model = this;
    this.root.root = this.root;

    this.ids = {};
    this.classes = {};
    this.traits = {};
    this.types = {};
    this.nodes = [];
    this.watchers = [];
    this.fire = false;

    this.lastNode = null;

    this.event = { type: "update" };

    // Init CSSauron
    if (language == null) {
      language = cssauron({
        tag: "type",
        id: "id",
        class: "classes.join(' ')",
        parent: "parent",
        children: "children",
        attr: "traits.hash[attr]",
      });
    }

    // Triggered by child addition/removal
    const add = (event) => adopt(event.node);
    const remove = (event) => dispose(event.node);

    this.root.on("add", add);
    this.root.on("remove", remove);

    // Track node lifecycle
    const adopt = (node) => {
      addNode(node);
      addType(node);
      addTraits(node);

      node.on("change:node", update);
      update(null, node, true);
      return force(node);
    };

    const dispose = (node) => {
      removeNode(node);
      removeType(node);
      removeTraits(node);
      removeID(node.id, node);
      removeClasses(node.classes, node);

      node.off("change:node", update);
      return force(node);
    };

    // Watcher cycle for catching changes in id/classes
    const prime = (node) => {
      for (const watcher of Array.from(this.watchers)) {
        watcher.match = watcher.matcher(node);
      }
      return null;
    };

    const check = (node) => {
      for (const watcher of Array.from(this.watchers)) {
        const fire =
          watcher.fire ||
          (watcher.fire = watcher.match !== watcher.matcher(node));
        if (fire) {
          this.lastNode = node;
        }
        if (!this.fire) {
          this.fire = fire;
        }
      }
      return null;
    };

    const force = (node) => {
      for (const watcher of Array.from(this.watchers)) {
        const fire = watcher.fire || (watcher.fire = watcher.matcher(node));
        if (fire) {
          this.lastNode = node;
        }
        if (!this.fire) {
          this.fire = fire;
        }
      }
      return null;
    };

    this.digest = () => {
      if (!this.fire) {
        return false;
      }
      for (const watcher of Array.from(this.watchers.slice())) {
        if (watcher.fire) {
          watcher.fire = false;
          watcher.handler();
        }
      }
      this.fire = false;
      return true;
    };

    // Track id/class changes
    const update = (event, node, init) => {
      const _id = init || event.changed["node.id"];
      const _klass = init || event.changed["node.classes"];
      let primed = false;

      if (_id) {
        const id = node.get("node.id");
        if (id !== node.id) {
          if (!init) {
            prime(node);
          }
          primed = true;

          if (node.id != null) {
            removeID(node.id, node);
          }
          addID(id, node);
        }
      }

      if (_klass) {
        let left;
        let classes = (left = node.get("node.classes")) != null ? left : [];
        const klass = classes.join(",");
        if (klass !== (node.classes != null ? node.classes.klass : undefined)) {
          classes = classes.slice();

          if (!init && !primed) {
            prime(node);
          }
          primed = true;

          if (node.classes != null) {
            removeClasses(node.classes, node);
          }
          addClasses(classes, node);

          node.classes = classes;
          node.classes.klass = klass;
        }
      }

      if (!init && primed) {
        check(node);
      }
      return null;
    };

    // Manage lookup tables for types/classes/traits
    const addTags = function (sets, tags, node) {
      if (tags == null) {
        return;
      }
      for (const k of Array.from(tags)) {
        const list = sets[k] != null ? sets[k] : [];
        list.push(node);
        sets[k] = list;
      }
      return null;
    };

    const removeTags = function (sets, tags, node) {
      if (tags == null) {
        return;
      }
      for (const k of Array.from(tags)) {
        const list = sets[k];
        const index = list.indexOf(node);
        if (index >= 0) {
          list.splice(index, 1);
        }
        if (list.length === 0) {
          delete sets[k];
        }
      }
      return null;
    };

    // Build a hash for an array of tags for quick lookups
    const hashTags = function (array) {
      if (!(array.length > 0)) {
        return;
      }
      const hash = (array.hash = {});
      return Array.from(array).map((klass) => (hash[klass] = true));
    };

    const unhashTags = (array) => delete array.hash;

    // Track IDs (live)
    const addID = (id, node) => {
      if (this.ids[id]) {
        throw new Error(`Duplicate node id \`${id}\``);
      }

      if (id != null) {
        this.ids[id] = [node];
      }
      return (node.id = id != null ? id : node._id);
    };

    const removeID = (id, node) => {
      if (id != null) {
        delete this.ids[id];
      }
      return (node.id = node._id);
    };

    // Track classes (live)
    const addClasses = (classes, node) => {
      addTags(this.classes, classes, node);
      if (classes != null) {
        return hashTags(classes);
      }
    };

    const removeClasses = (classes, node) => {
      removeTags(this.classes, classes, node);
      if (classes != null) {
        return unhashTags(classes);
      }
    };

    // Track nodes
    const addNode = (node) => this.nodes.push(node);
    const removeNode = (node) => this.nodes.splice(this.nodes.indexOf(node), 1);

    // Track nodes by type
    const addType = (node) => addTags(this.types, [node.type], node);
    const removeType = (node) => removeTags(this.types, [node.type], node);

    // Track nodes by trait
    const addTraits = (node) => {
      addTags(this.traits, node.traits, node);
      return hashTags(node.traits);
    };

    const removeTraits = (node) => {
      removeTags(this.traits, node.traits, node);
      return unhashTags(node.traits);
    };

    adopt(this.root);
    this.root.trigger({ type: "added" });
  }

  // Filter array by selector
  filter(nodes, selector) {
    const matcher = this._matcher(selector);
    return (() => {
      const result = [];
      for (const node of Array.from(nodes)) {
        if (matcher(node)) {
          result.push(node);
        }
      }
      return result;
    })();
  }

  // Filter array by ancestry
  ancestry(nodes, parents) {
    const out = [];
    for (const node of Array.from(nodes)) {
      let { parent } = node;
      while (parent != null) {
        if (Array.from(parents).includes(parent)) {
          out.push(node);
          break;
        }
        ({ parent } = parent);
      }
    }
    return out;
  }

  // Query model by (scoped) selector
  select(selector, parents) {
    let matches = this._select(selector);
    if (parents != null) {
      matches = this.ancestry(matches, parents);
    }
    matches.sort((a, b) => b.order - a.order);
    return matches;
  }

  // Watch selector with handler
  watch(selector, handler) {
    let watcher;
    handler.unwatch = () => this.unwatch(handler);
    handler.watcher = watcher = {
      selector,
      handler,
      matcher: this._matcher(selector),
      match: false,
      fire: false,
    };
    this.watchers.push(watcher);
    return this.select(selector);
  }

  // Unwatch a handler
  unwatch(handler) {
    const { watcher } = handler;
    if (watcher == null) {
      return;
    }

    this.watchers.splice(this.watchers.indexOf(watcher), 1);
    delete handler.unwatch;
    return delete handler.watcher;
  }

  // Check for simplified selector
  _simplify(s) {
    // Trim whitespace
    let all, auto, id, klass, trait, type;
    s = s.replace(/^\s+/, "");
    s = s.replace(/\s+$/, "");

    // Look for *, #id, .class, type, auto
    let found = (all = s === ALL);
    if (!found) {
      found = id = __guard__(s.match(ID), (x) => x[1]);
    }
    if (!found) {
      found = klass = __guard__(s.match(CLASS), (x1) => x1[1]);
    }
    if (!found) {
      found = trait = __guard__(s.match(TRAIT), (x2) => x2[1]);
    }
    if (!found) {
      found = type = __guard__(s.match(TYPE), (x3) => x3[0]);
    }
    if (!found) {
      found = auto = __guard__(s.match(AUTO), (x4) => x4[0]);
    }
    return [all, id, klass, trait, type, auto];
  }

  // Make a matcher for a single selector
  _matcher(s) {
    // Check for simple *, #id, .class or type selector
    const [all, id, klass, trait, type, auto] = Array.from(this._simplify(s));
    if (all) {
      return (_node) => true;
    }
    if (id) {
      return (node) => node.id === id;
    }
    if (klass) {
      return (node) =>
        __guard__(
          node.classes != null ? node.classes.hash : undefined,
          (x) => x[klass]
        );
    }
    if (trait) {
      return (node) =>
        __guard__(
          node.traits != null ? node.traits.hash : undefined,
          (x) => x[trait]
        );
    }
    if (type) {
      return (node) => node.type === type;
    }
    if (auto) {
      throw "Auto-link matcher unsupported";
    }

    // Otherwise apply CSSauron filter
    return language(s);
  }

  // Query single selector
  _select(s) {
    // Check for simple *, #id, .class or type selector
    const [all, id, klass, trait, type] = Array.from(this._simplify(s));
    if (all) {
      return this.nodes;
    }
    if (id) {
      return this.ids[id] != null ? this.ids[id] : [];
    }
    if (klass) {
      return this.classes[klass] != null ? this.classes[klass] : [];
    }
    if (trait) {
      return this.traits[trait] != null ? this.traits[trait] : [];
    }
    if (type) {
      return this.types[type] != null ? this.types[type] : [];
    }

    // Otherwise apply CSSauron to everything
    return this.filter(this.nodes, s);
  }

  getRoot() {
    return this.root;
  }

  getLastTrigger() {
    return this.lastNode.toString();
  }
}

function __guard__(value, transform) {
  return typeof value !== "undefined" && value !== null
    ? transform(value)
    : undefined;
}

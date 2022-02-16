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
/*
 Custom attribute model
 - Organizes attributes by trait in .attributes
 - Provides constant-time .props / .get() access to flat dictionary
 - Provides .get(key) with or without trait namespaces
 - Change attributes with .set(key) or .set(dictionary)
 - Validation is double-buffered and in-place to detect changes and nops
 - Change notifications are coalesced per object and per trait, digested later
 - Values are stored in three.js uniform-style objects so they can be bound as GL uniforms
 - Originally passed (unnormalized) values are preserved and can be fetched via .orig()
 - Attributes can be defined as final/const
 - Attributes can be computed from both public or private expressions with .bind(key, false/true)
 - Expressions are time-dependent, can be time-travelled with .evaluate()
 - This enables continous simulation and data logging despite choppy animation updates

  Actual type and trait definitions are injected from Primitives
*/

export class Attributes {
  constructor(definitions, context) {
    this.context = context;
    this.traits = definitions.Traits;
    this.types = definitions.Types;
    this.pending = [];
    this.bound = [];
    this.last = null;
  }

  make(type) {
    return {
      enum: typeof type.enum === "function" ? type.enum() : undefined,
      type: typeof type.uniform === "function" ? type.uniform() : undefined, // for three.js
      value: type.make(),
    };
  }

  apply(object, config) {
    return new Data(object, config, this);
  }

  bind(callback) {
    return this.bound.push(callback);
  }
  unbind(callback) {
    return (this.bound = Array.from(this.bound).filter(
      (cb) => cb !== callback
    ));
  }

  queue(callback, object, key, value) {
    this.lastObject = object;
    this.lastKey = key;
    this.lastValue = value;
    return this.pending.push(callback);
  }

  invoke(callback) {
    return callback(this.context.time.clock, this.context.time.step);
  }

  compute() {
    if (this.bound.length) {
      for (let cb of Array.from(this.bound)) {
        this.invoke(cb);
      }
    }
  }

  digest() {
    let calls;
    if (!this.pending.length) {
      return false;
    }

    [calls, this.pending] = Array.from([this.pending, []]);
    for (let callback of Array.from(calls)) {
      callback();
    }

    return true;
  }

  getTrait(name) {
    return this.traits[name];
  }

  getLastTrigger() {
    return `${this.lastObject.toString()} - ${this.lastKey}=\`${
      this.lastValue
    }\``;
  }
}

const shallowCopy = function (x) {
  const out = {};
  for (let k in x) {
    const v = x[k];
    out[k] = v;
  }
  return out;
};

class Data {
  constructor(object, config, _attributes) {
    let key, ns, oldComputed, oldExpr, oldOrig, oldProps, spec;
    let { traits, props, finals, freeform } = config;
    const data = this;

    // Save existing (original) values if re-applying
    if (
      object.props != null &&
      object.expr != null &&
      object.orig != null &&
      object.computed != null &&
      object.attributes != null
    ) {
      oldProps = shallowCopy(object.props);
      oldExpr = shallowCopy(object.expr);
      oldOrig = object.orig();
      oldComputed = object.computed();

      // Dispose of old attributes/bindings
      if (object.attributes != null) {
        object.attributes.dispose();
      }
    }

    // Flattened and original values
    const flattened = {};
    const originals = {};

    // Aliases
    const mapTo = {};
    const to = (name) => (mapTo[name] != null ? mapTo[name] : name);
    const define = function (name, alias) {
      if (mapTo[alias]) {
        throw new Error(
          `${object.toString()} - Duplicate property \`${alias}\``
        );
      }
      return (mapTo[alias] = name);
    };

    // Get/set
    const get = (key) =>
      (data[key] != null ? data[key].value : undefined) != null
        ? data[key] != null
          ? data[key].value
          : undefined
        : __guard__(data[to(key)], (x) => x.value);
    const set = function (key, value, ignore, initial) {
      let attr;
      key = to(key);

      // Look for defined attribute
      if ((attr = data[key]) == null) {
        if (!freeform) {
          throw new Error(
            `${object.toString()} - Setting unknown property \`${key}={${value}}\``
          );
        }

        // Define attribute on the fly (placeholder)
        attr = data[key] = {
          short: key,
          type: null,
          last: null,
          value: null,
        };
        validators[key] = (v) => v;
      }

      if (!ignore) {
        // See if prop isn't bound
        if (_expr[key]) {
          throw new Error(
            `${object.toString()} - Can't set bound property \`${key}={${value}}\``
          );
        }

        // See if prop isn't computed
        if (_computed[key]) {
          throw new Error(
            `${object.toString()} - Can't set computed property \`${key}={${value}}\``
          );
        }

        // See if prop isn't final
        if (_finals[key]) {
          throw new Error(
            `${object.toString()} - Can't set final property \`${key}={${value}}\``
          );
        }
      }

      // Validate new value
      let valid = true;
      const validated = validate(key, value, attr.last, function () {
        valid = false;
        return null;
      });

      // Accept and insert into flattened/original list
      if (valid) {
        [attr.value, attr.last] = Array.from([validated, attr.value]);

        // Remember in flattened dict
        const { short } = attr;
        flattened[short] = validated;
        if (!ignore) {
          originals[short] = value;
        } // Remember original unvalidated value

        // Compare to last value unless setting initial value
        if (!initial && !equals(key, attr.value, attr.last)) {
          change(key, value);
        }
      }

      return valid;
    };

    const constant = function (key, value, initial) {
      key = to(key);

      set(key, value, true, initial);
      return (_finals[key] = true);
    };

    // Prop/expression binding
    const expr = {};

    const _bound = {};
    const _eval = {};
    var _expr = {};
    var _computed = {};
    var _finals = {};

    const bind = function (key, expression, computed) {
      if (computed == null) {
        computed = false;
      }
      key = to(key);

      if (typeof expression !== "function") {
        throw new Error(
          `${object.toString()} - Expression \`${key}=>{${expr}}\` is not a function`
        );
      }
      if (_expr[key]) {
        throw new Error(
          `${object.toString()} - Property \`${key}=>{${expr}}\` is already bound`
        );
      }
      if (_computed[key]) {
        throw new Error(
          `${object.toString()} - Property \`${key}\` is computed`
        );
      }
      if (_finals[key]) {
        throw new Error(`${object.toString()} - Property \`${key}\` is final`);
      }

      const list = computed ? _computed : _expr;
      list[key] = expression;

      const short = data[key] != null ? data[key].short : key;
      if (!computed) {
        expr[short] = expression;
      } // flattened
      _eval[key] = expression;

      expression = expression.bind(object);
      _bound[key] = function (t, d) {
        let clock;
        if (
          (clock = object.clock != null ? object.clock.getTime() : undefined)
        ) {
          t = clock.clock;
          d = clock.step;
        }

        return object.set(key, expression(t, d), true);
      };
      return _attributes.bind(_bound[key]);
    };

    const unbind = function (key, computed) {
      if (computed == null) {
        computed = false;
      }
      key = to(key);

      const list = computed ? _computed : _expr;
      if (!list[key]) {
        return;
      }
      _attributes.unbind(_bound[key]);
      delete _bound[key];
      delete list[key];

      if (data[key] != null) {
        key = data[key].short;
      }
      return delete expr[key];
    };

    const evaluate = function (key, time) {
      let left;
      key = to(key);
      return (left =
        typeof _eval[key] === "function" ? _eval[key](time, 0) : undefined) !=
        null
        ? left
        : data[key].value;
    };

    // Public interface
    object.expr = expr;
    object.props = flattened;

    object.evaluate = function (key, time) {
      if (key != null) {
        return evaluate(key, time);
      } else {
        const out = {};
        for (key in props) {
          out[key] = evaluate(key, time);
        }
        return out;
      }
    };

    object.get = function (key) {
      if (key != null) {
        return get(key);
      } else {
        return flattened;
      }
    };

    object.set = function (key, value, ignore, initial) {
      if (typeof key === "string") {
        set(key, value, ignore, initial);
      } else {
        initial = ignore;
        ignore = value;
        const options = key;
        for (key in options) {
          value = options[key];
          set(key, value, ignore, initial);
        }
      }
    };

    object.bind = function (key, expr, computed) {
      if (typeof key === "string") {
        bind(key, expr, computed);
      } else {
        computed = expr;
        const binds = key;
        for (key in binds) {
          expr = binds[key];
          bind(key, expr, computed);
        }
      }
    };

    object.unbind = function (key, computed) {
      if (typeof key === "string") {
        unbind(key, computed);
      } else {
        computed = expr;
        const binds = key;
        for (key in binds) {
          unbind(key, computed);
        }
      }
    };

    object.attribute = function (key) {
      if (key != null) {
        return data[to(key)];
      } else {
        return data;
      }
    };
    object.orig = function (key) {
      if (key != null) {
        return originals[to(key)];
      } else {
        return shallowCopy(originals);
      }
    };
    object.computed = function (key) {
      if (key != null) {
        return _computed[to(key)];
      } else {
        return shallowCopy(_computed);
      }
    };

    // Validate value for key
    const makers = {};
    var validators = {};
    const equalors = {};

    var equals = (key, value, target) => equalors[key](value, target);
    var validate = (key, value, target, invalid) =>
      validators[key](value, target, invalid);

    object.validate = function (key, value) {
      let target;
      key = to(key);
      const make = makers[key];
      if (make != null) {
        target = make();
      }
      return (target = validate(key, value, target, function () {
        throw new Error(
          `${object.toString()} - Invalid value \`${key}={${value}}\``
        );
      }));
    };

    // Accumulate changes
    let dirty = false;
    let changes = {};
    let touches = {};
    let changed = {};
    let touched = {};
    const getNS = (key) => key.split(".")[0];
    var change = function (key, value) {
      if (!dirty) {
        dirty = true;
        _attributes.queue(digest, object, key, value);
      }

      const trait = getNS(key);

      // Log change
      changes[key] = true;

      // Mark trait/namespace as dirty
      return (touches[trait] = true);
    };

    const event = {
      type: "change",
      changed: null,
      touched: null,
    };

    // Notify listeners of accumulated changes
    var digest = function () {
      // Swap double buffered changes objects
      let k;
      event.changed = changes;
      event.touched = touches;
      changes = changed;
      touches = touched;
      ({ changed } = event);
      ({ touched } = event);

      // Reset all dirty flags
      dirty = false;
      for (k in changes) {
        changes[k] = false;
      }
      for (k in touches) {
        touches[k] = false;
      }

      event.type = "change";
      object.trigger(event);

      return (() => {
        const result = [];
        for (let trait in event.touched) {
          event.type = `change:${trait}`;
          result.push(object.trigger(event));
        }
        return result;
      })();
    };

    // Convert name.trait.key into keyName
    const shorthand = function (name) {
      const parts = name.split(/\./g);
      const suffix = parts.pop();
      parts.pop(); // Discard
      parts.unshift(suffix);
      return parts.reduce(
        (a, b) => a + b.charAt(0).toUpperCase() + b.substring(1)
      );
    };

    // Define attributes for given trait spec by namespace
    const addSpec = (name, spec) =>
      (() => {
        const result = [];
        for (let key in spec) {
          var value;
          const type = spec[key];
          key = [name, key].join(".");
          const short = shorthand(key);

          // Make attribute object
          data[key] = {
            T: type,
            ns: name,
            short,
            enum: typeof type.enum === "function" ? type.enum() : undefined,
            type:
              typeof type.uniform === "function" ? type.uniform() : undefined,
            last: type.make(),
            value: (value = type.make()),
          };

          // Define flat namespace alias
          define(key, short);
          flattened[short] = value;

          // Collect makers, validators and comparators
          makers[key] = type.make;
          validators[key] = type.validate != null ? type.validate : (a) => a;
          result.push(
            (equalors[key] =
              type.equals != null ? type.equals : (a, b) => a === b)
          );
        }
        return result;
      })();

    // Add in traits
    const list = [];
    for (let trait of Array.from(traits)) {
      [trait, ns] = Array.from(trait.split(":"));
      const name = ns ? [ns, trait].join(".") : trait;
      spec = _attributes.getTrait(trait);
      list.push(trait);

      if (spec != null) {
        addSpec(name, spec);
      }
    }

    // Add custom props by namespace
    if (props != null) {
      for (ns in props) {
        spec = props[ns];
        addSpec(ns, spec);
      }
    }

    // Store array of traits
    const unique = list.filter((object, i) => list.indexOf(object) === i);
    object.traits = unique;

    // Set previous internal values
    if (oldProps != null) {
      object.set(oldProps, true, true);
    }

    // Set final props
    if (finals != null) {
      for (key in finals) {
        const value = finals[key];
        constant(key, value, true);
      }
    }

    // Set previous external values
    if (oldOrig != null) {
      object.set(oldOrig, false, true);
    }

    // Bind previous computed props/expressions
    if (oldComputed != null) {
      object.bind(oldComputed, true);
    }
    if (oldExpr != null) {
      object.bind(oldExpr, false);
    }

    // Destructor
    this.dispose = function () {
      for (key in _computed) {
        unbind(key, true);
      }
      for (key in _expr) {
        unbind(key, false);
      }
      props = {};
      delete object.attributes;
      delete object.get;
      return delete object.set;
    };

    null;
  }
}

function __guard__(value, transform) {
  return typeof value !== "undefined" && value !== null
    ? transform(value)
    : undefined;
}

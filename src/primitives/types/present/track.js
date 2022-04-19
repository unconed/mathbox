// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as Ease from "../../../util/ease.js";
import { Primitive } from "../../primitive.js";

const deepCopy = function (x) {
  const out = {};
  for (const k in x) {
    const v = x[k];
    if (v instanceof Array) {
      out[k] = v.slice();
    } else if (v != null && typeof v === "object") {
      out[k] = deepCopy(v);
    } else {
      out[k] = v;
    }
  }

  return out;
};

export class Track extends Primitive {
  static initClass() {
    this.traits = ["node", "track", "seek", "bind"];
  }

  init() {
    this.handlers = {};
    this.script = null;
    this.values = null;
    this.playhead = 0;
    this.velocity = null;
    this.section = null;
    return (this.expr = null);
  }

  make() {
    // Bind to attached data sources
    let ref;
    this._helpers.bind.make([
      { to: "track.target", trait: "node", callback: null },
    ]);

    const { script } = this.props;
    const { node } = this.bind.target;

    this.targetNode = node;
    return (
      ([this.script, this.values, this.start, this.end] = Array.from(
        (ref = this._process(node, script))
      )),
      ref
    );
  }

  unmake() {
    this.unbindExpr();
    this._helpers.bind.unmake();
    this.script =
      this.values =
      this.start =
      this.end =
      this.section =
      this.expr =
        null;
    return (this.playhead = 0);
  }

  // Bind animated expressions
  bindExpr(expr) {
    this.unbindExpr();
    this.expr = expr;
    this.targetNode.bind(expr, true);

    // Measure playhead velocity on attribute computation
    const { clock } = this.targetNode;
    const self = this;
    return this._attributes.bind(
      (this.measure = (function () {
        let playhead = null;
        return () => {
          const { step } = clock.getTime();
          if (playhead != null) {
            self.velocity = (self.playhead - playhead) / step;
          }
          return (playhead = self.playhead);
        };
      })())
    );
  }

  unbindExpr() {
    if (this.expr != null) {
      this.targetNode.unbind(this.expr, true);
    }
    if (this.measure != null) {
      this._attributes.unbind(this.measure);
    }
    return (this.expr = this.measure = null);
  }

  // Process script steps by filling out missing props
  _process(object, script) {
    let k, key, last, message, s, step, v;
    if (script instanceof Array) {
      // Normalize array to numbered dict
      s = {};
      for (let i = 0; i < script.length; i++) {
        step = script[i];
        s[i] = step;
      }
      script = s;
    }

    // Normalize keyed steps to array of step objects
    s = [];
    for (key in script) {
      step = script[key];
      if (step == null) {
        step = [];
      }

      if (step instanceof Array) {
        // [props, bind] array
        step = {
          key: +key,
          props: step[0] != null ? deepCopy(step[0]) : {},
          bind: step[1] != null ? deepCopy(step[1]) : {},
        };
      } else {
        if (step.key == null && !step.props && !step.bind) {
          // Direct props object (iffy, but people will do this anyhow)
          step = { props: deepCopy(step) };
        } else {
          // Proper step
          step = deepCopy(step);
        }

        // Prepare step object
        step.key = step.key != null ? +step.key : +key;
        if (step.props == null) {
          step.props = {};
        }
        if (step.bind == null) {
          step.bind = {};
        }
      }

      s.push(step);
    }
    script = s;

    if (!script.length) {
      return [[], {}, 0, 0];
    }

    // Sort by keys
    script.sort((a, b) => a.key - b.key);
    const start = script[0].key;
    const end = script[script.length - 1].key;

    // Connect steps
    for (key in script) {
      step = script[key];
      if (last != null) {
        last.next = step;
      }
      last = step;
    }

    // Last step leads to itself
    last.next = last;
    script = s;

    // Determine starting props
    const props = {};
    const values = {};
    for (key in script) {
      step = script[key];
      for (k in step.props) {
        v = step.props[k];
        props[k] = true;
      }
    }
    for (key in script) {
      step = script[key];
      for (k in step.bind) {
        v = step.bind[k];
        props[k] = true;
      }
    }
    for (k in props) {
      props[k] = object.get(k);
    }
    try {
      // Need two sources and one destination value for correct mixing of live expressions
      for (k in props) {
        values[k] = [
          object.attribute(k).T.make(),
          object.attribute(k).T.make(),
          object.attribute(k).T.make(),
        ];
      }
    } catch (error) {
      console.warn(this.node.toMarkup());
      message = `${this.node.toString()} - Target ${object} has no \`${k}\` property`;
      throw new Error(message);
    }

    const result = [];

    // Normalize script props, insert held values
    for (step of Array.from(script)) {
      for (k in props) {
        v = props[k];
        v = object.validate(k, step.props[k] != null ? step.props[k] : v);
        props[k] = step.props[k] = v;

        if (step.bind[k] != null && typeof step.bind[k] !== "function") {
          console.warn(this.node.toMarkup());
          message = `${this.node.toString()} - Bind expression \`${
            step.bind[k]
          }\` on property \`${k}\` is not a function`;
          throw new Error(message);
        }
      }
      result.push(step);
    }

    return [result, values, start, end];
  }

  update() {
    let { playhead } = this;
    const { script } = this;
    const { ease, seek } = this.props;
    const node = this.targetNode;

    if (seek != null) {
      playhead = seek;
    }

    if (script.length) {
      let k;
      const find = function () {
        let last = script[0];
        for (let i = 0; i < script.length; i++) {
          const step = script[i];
          if (step.key > playhead) {
            break;
          }
          last = step;
        }
        return last;
      };

      let { section } = this;
      if (!section || playhead < section.key || playhead > section.next.key) {
        section = find(script, playhead);
      }

      if (section === this.section) {
        return;
      }
      this.section = section;

      const from = section;
      const to = section.next;
      const start = from.key;
      const end = to.key;

      // Easing of playhead along track
      const easeMethod = (() => {
        switch (ease) {
          case "linear":
          case 0:
            return Ease.clamp;
          case "cosine":
          case 1:
            return Ease.cosine;
          case "binary":
          case 2:
            return Ease.binary;
          case "hold":
          case 3:
            return Ease.hold;
          default:
            return Ease.cosine;
        }
      })();

      // Callback for live playhead interpolator (linear approx time travel)
      const { clock } = node;
      const getPlayhead = (time) => {
        if (this.velocity == null) {
          return this.playhead;
        }
        const now = clock.getTime();
        return this.playhead + this.velocity * (time - now.time);
      };

      const getLerpFactor = (function () {
        const scale = 1 / Math.max(0.0001, end - start);
        return (time) => easeMethod((getPlayhead(time) - start) * scale, 0, 1);
      })();

      // Create prop expression interpolator
      const live = (key) => {
        const fromE = from.bind[key];
        const toE = to.bind[key];
        const fromP = from.props[key];
        const toP = to.props[key];

        const invalid = function () {
          console.warn(node.toMarkup());
          throw new Error(
            `${this.node.toString()} - Invalid expression result on track \`${key}\``
          );
        };

        const attr = node.attribute(key);
        const values = this.values[key];
        const animator = this._animator;

        // Lerp between two expressions
        if (fromE && toE) {
          return ((values, _from, _to) =>
            function (time, delta) {
              let _from, _to;
              values[0] = _from = attr.T.validate(
                fromE(time, delta),
                values[0],
                invalid
              );
              values[1] = _to = attr.T.validate(
                toE(time, delta),
                values[1],
                invalid
              );
              return (values[2] = animator.lerp(
                attr.T,
                _from,
                _to,
                getLerpFactor(time),
                values[2]
              ));
            })(values, from, to);

          // Lerp between an expression and a constant
        } else if (fromE) {
          return ((values, _from, _to) =>
            function (time, delta) {
              let _from;
              values[0] = _from = attr.T.validate(
                fromE(time, delta),
                values[0],
                invalid
              );
              return (values[1] = animator.lerp(
                attr.T,
                _from,
                toP,
                getLerpFactor(time),
                values[1]
              ));
            })(values, from, to);

          // Lerp between a constant and an expression
        } else if (toE) {
          return ((values, _from, _to) =>
            function (time, delta) {
              let _to;
              values[0] = _to = attr.T.validate(
                toE(time, delta),
                values[0],
                invalid
              );
              return (values[1] = animator.lerp(
                attr.T,
                fromP,
                _to,
                getLerpFactor(time),
                values[1]
              ));
            })(values, from, to);

          // Lerp between two constants
        } else {
          return (
            (values, _from, _to) => (time, _delta) =>
              (values[0] = animator.lerp(
                attr.T,
                fromP,
                toP,
                getLerpFactor(time),
                values[0]
              ))
          )(values, from, to);
        }
      };

      // Handle expr / props on both ends
      const expr = {};
      for (k in from.bind) {
        if (expr[k] == null) {
          expr[k] = live(k);
        }
      }
      for (k in to.bind) {
        if (expr[k] == null) {
          expr[k] = live(k);
        }
      }
      for (k in from.props) {
        if (expr[k] == null) {
          expr[k] = live(k);
        }
      }
      for (k in to.props) {
        if (expr[k] == null) {
          expr[k] = live(k);
        }
      }

      // Bind node props
      return this.bindExpr(expr);
    }
  }

  change(changed, touched, init) {
    if (
      changed["track.target"] ||
      changed["track.script"] ||
      changed["track.mode"]
    ) {
      return this.rebuild();
    }

    if (changed["seek.seek"] || init) {
      return this.update();
    }
  }
}
Track.initClass();

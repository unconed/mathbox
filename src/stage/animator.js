// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as Ease from "../util/ease.js";

export class Animator {
  constructor(context) {
    this.context = context;
    this.anims = [];
  }

  make(type, options) {
    const anim = new Animation(this, this.context.time, type, options);
    this.anims.push(anim);
    return anim;
  }

  unmake(anim) {
    return (this.anims = Array.from(this.anims).filter((a) => a !== anim));
  }

  update() {
    const { time } = this.context;
    return (this.anims = (() => {
      const result = [];
      for (let anim of Array.from(this.anims)) {
        if (anim.update(time) !== false) {
          result.push(anim);
        }
      }
      return result;
    })());
  }

  lerp(type, from, to, f, value) {
    if (value == null) {
      value = type.make();
    }

    // Use the most appropriate interpolation method for the type

    // Direct lerp operator
    if (type.lerp) {
      value = type.lerp(from, to, value, f);

      // Substitute emitter
    } else if (type.emitter) {
      const fromE = from.emitterFrom;
      const toE = to.emitterTo;

      if (fromE != null && toE != null && fromE === toE) {
        fromE.lerp(f);
        return fromE;
      } else {
        const emitter = type.emitter(from, to);
        from.emitterFrom = emitter;
        to.emitterTo = emitter;
        emitter.lerp(f);
        return emitter;
      }

      // Generic binary operator
    } else if (type.op) {
      const lerp = function (a, b) {
        if (a === +a && b === +b) {
          // Lerp numbers
          return a + (b - a) * f;
        } else {
          // No lerp
          if (f > 0.5) {
            return b;
          } else {
            return a;
          }
        }
      };

      value = type.op(from, to, value, lerp);

      // No lerp
    } else {
      value = f > 0.5 ? to : from;
    }

    return value;
  }
}

class Animation {
  constructor(animator, time, type, options) {
    this.animator = animator;
    this.time = time;
    this.type = type;
    this.options = options;
    this.value = this.type.make();
    this.target = this.type.make();

    this.queue = [];
  }

  dispose() {
    return this.animator.unmake(this);
  }

  set() {
    let { target } = this;
    let value = arguments.length > 1 ? [].slice.call(arguments) : arguments[0];

    let invalid = false;
    value = this.type.validate(value, target, () => (invalid = true));
    if (!invalid) {
      target = value;
    }

    this.cancel();
    this.target = this.value;
    this.value = target;
    return this.notify();
  }

  getTime() {
    const { clock } = this.options;
    const time = clock ? clock.getTime() : this.time;
    if (this.options.realtime) {
      return time.time;
    } else {
      return time.clock;
    }
  }

  cancel(from) {
    let stage;
    if (from == null) {
      from = this.getTime();
    }
    const { queue } = this;

    const cancelled = (() => {
      const result = [];
      for (stage of Array.from(queue)) {
        if (stage.end >= from) {
          result.push(stage);
        }
      }
      return result;
    })();
    this.queue = (() => {
      const result1 = [];
      for (stage of Array.from(queue)) {
        if (stage.end < from) {
          result1.push(stage);
        }
      }
      return result1;
    })();

    for (stage of Array.from(cancelled)) {
      if (typeof stage.complete === "function") {
        stage.complete(false);
      }
    }
    if (typeof this.options.complete === "function") {
      this.options.complete(false);
    }
  }

  notify() {
    return typeof this.options.step === "function"
      ? this.options.step(this.value)
      : undefined;
  }

  immediate(value, options) {
    const { duration, delay, ease, step, complete } = options;

    const time = this.getTime();

    const start = time + delay;
    const end = start + duration;

    let invalid = false;
    let target = this.type.make();
    value = this.type.validate(value, target, function () {
      invalid = true;
      return null;
    });
    if (value !== undefined && !invalid) {
      target = value;
    }

    this.cancel(start);
    return this.queue.push({
      from: null,
      to: target,
      start,
      end,
      ease,
      step,
      complete,
    });
  }

  update(time) {
    this.time = time;
    if (this.queue.length === 0) {
      return true;
    }

    const clock = this.getTime();
    let { value, queue } = this;

    let active = false;
    while (!active) {
      var stage;
      var { from, to, start, end, step, complete, ease } = (stage = queue[0]);

      if (from == null) {
        from = stage.from = this.type.clone(this.value);
      }

      let f = Ease.clamp(
        (clock - start) / Math.max(0.00001, end - start) || 0,
        0,
        1
      );
      if (f === 0) {
        return;
      } // delayed animation not yet active

      const method = (() => {
        switch (ease) {
          case "linear":
          case 0:
            return null;
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
      if (method != null) {
        f = method(f);
      }

      active = f < 1;
      value = active ? this.animator.lerp(this.type, from, to, f, value) : to;

      //console.log 'animation step', f, from, to, value
      if (typeof step === "function") {
        step(value);
      }

      if (!active) {
        if (typeof complete === "function") {
          complete(true);
        }
        if (typeof this.options.complete === "function") {
          this.options.complete(true);
        }
        queue.shift();
        if (queue.length === 0) {
          break;
        } // end of queue
      }
    }

    this.value = value;
    return this.notify();
  }
}

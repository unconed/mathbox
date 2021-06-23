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
import { Track } from "./track";

export class Step extends Track {
  static initClass() {
    this.traits = ["node", "track", "step", "trigger", "bind"];
  }

  make() {
    super.make();

    const clock = this._inherit("clock");

    if (this.actualIndex == null) {
      this.actualIndex = null;
    }
    this.animateIndex = this._animator.make(this._types.number(0), {
      clock,
      realtime: this.props.realtime,
      step: (value) => {
        return (this.actualIndex = value);
      },
    });

    if (this.lastIndex == null) {
      this.lastIndex = null;
    }
    this.animateStep = this._animator.make(this._types.number(0), {
      clock,
      realtime: this.props.realtime,
      step: (value) => {
        this.playhead = value;
        return this.update();
      },
    });

    this.stops =
      this.props.stops != null
        ? this.props.stops
        : __range__(0, this.script.length, false);

    // Seek instantly after reset
    this._listen("slide", "slide.reset", (_e) => {
      return (this.lastIndex = null);
    });

    // Update playhead in response to slide change
    return this._listen("slide", "slide.step", (e) => {
      let left;
      let { delay, duration, pace, speed, playback, rewind, skip, trigger } =
        this.props;

      // Note: enter phase is from index 0 to 1
      const i = Math.max(0, Math.min(this.stops.length - 1, e.index - trigger));

      // Animation range
      const from = this.playhead;
      const to = this.stops[i];

      // Seek if first step after reset
      if (this.lastIndex == null && trigger) {
        this.lastIndex = i;
        this.animateStep.set(to);
        this.animateIndex.set(i);
        return;
      }

      // Calculate actual step from current offset (may be still animating)
      let last =
        (left = this.actualIndex != null ? this.actualIndex : this.lastIndex) !=
        null
          ? left
          : 0;
      const step = i - last;

      // Don't count duped stops
      const skips = this.stops.slice(Math.min(last, i), Math.max(last, i));
      let free = 0;
      last = skips.shift();
      for (let stop of Array.from(skips)) {
        if (last === stop) {
          free++;
        }
        last = stop;
      }

      // Remember last intended stop
      this.lastIndex = i;

      // Apply rewind factor
      let factor = speed * (e.step >= 0 ? 1 : rewind);

      // Pass through multiple steps at faster rate if skip is enabled
      factor *= skip ? Math.max(1, Math.abs(step) - free) : 1;

      // Apply pace
      duration += (Math.abs(to - from) * pace) / factor;

      if (from !== to) {
        this.animateIndex.immediate(i, { delay, duration, ease: playback });
        return this.animateStep.immediate(to, {
          delay,
          duration,
          ease: playback,
        });
      }
    });
  }

  made() {
    return this.update();
  }

  unmake() {
    this.animateIndex.dispose();
    this.animateStep.dispose();
    this.animateIndex = this.animateStep = null;

    return super.unmake();
  }

  change(changed, touched, init) {
    if (changed["step.stops"] || changed["step.realtime"]) {
      return this.rebuild();
    }
    return super.change(changed, touched, init);
  }
}
Step.initClass();

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}

// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Parent } from "../base/parent";

export class Clock extends Parent {
  static initClass() {
    this.traits = ["node", "clock", "seek", "play"];
  }

  init() {
    this.skew = 0;
    this.last = 0;
    return (this.time = {
      now: +new Date() / 1000,
      time: 0,
      delta: 0,
      clock: 0,
      step: 0,
    });
  }

  make() {
    // Listen to parent clock
    return this._listen("clock", "clock.tick", this.tick);
  }

  reset() {
    return (this.skew = 0);
  }

  tick(e) {
    const { from, to, speed, seek, pace, delay, realtime } = this.props;

    const parent = this._inherit("clock").getTime();

    const time = realtime ? parent.time : parent.clock;
    const delta = realtime ? parent.delta : parent.step;
    const ratio = speed / pace;

    this.skew += delta * (ratio - 1);
    if (this.last > time) {
      this.skew = 0;
    }

    this.time.now = parent.now + this.skew;

    this.time.time = parent.time;
    this.time.delta = parent.delta;

    const clock = seek != null ? seek : parent.clock + this.skew;
    this.time.clock = Math.min(to, from + Math.max(0, clock - delay * ratio));
    this.time.step = delta * ratio;

    this.last = time;

    return this.trigger(e);
  }

  getTime() {
    return this.time;
  }
}
Clock.initClass();

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

export class Now extends Parent {
  static initClass() {
    this.traits = ["node", "clock", "now"];
  }

  init() {
    let now;
    this.now = now = +new Date() / 1000;
    this.skew = 0;
    return (this.time = {
      now,
      time: 0,
      delta: 0,
      clock: 0,
      step: 0,
    });
  }

  make() {
    // Listen to parent clock
    this.clockParent = this._inherit("clock");
    return this._listen("clock", "clock.tick", this.tick);
  }

  unmake() {
    return (this.clockParent = null);
  }

  change(changed, _touched, _init) {
    if (changed["date.now"]) {
      return (this.skew = 0);
    }
  }

  tick(e) {
    const { seek, pace, speed } = this.props;

    const parent = this.clockParent.getTime();

    this.skew += (parent.step * pace) / speed;
    if (seek != null) {
      this.skew = seek;
    }

    this.time.now =
      this.time.time =
      this.time.clock =
        (this.props.now != null ? this.props.now : this.now) + this.skew;
    this.time.delta = this.time.step = parent.delta;

    return this.trigger(e);
  }

  getTime() {
    return this.time;
  }
}
Now.initClass();

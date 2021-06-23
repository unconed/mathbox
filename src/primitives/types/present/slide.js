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

export class Slide extends Parent {
  static initClass() {
    this.traits = ["node", "slide", "visible", "active"];
  }

  make() {
    this._helpers.visible.make();
    this._helpers.active.make();

    if (!this._inherit("present")) {
      throw new Error(
        `${this.node.toString()} must be placed inside <present></present>`
      );
    }

    return this._inherit("present").adopt(this);
  }

  unmake() {
    this._helpers.visible.unmake();
    this._helpers.active.unmake();

    return this._inherit("present").unadopt(this);
  }

  change(changed, _touched, _init) {
    if (
      changed["slide.early"] ||
      changed["slide.late"] ||
      changed["slide.steps"] ||
      changed["slide.from"] ||
      changed["slide.to"]
    ) {
      return this.rebuild();
    }
  }

  slideLatch(enabled, step) {
    //console.log 'slide:latch', @node.toString(), enabled, step
    this.trigger({
      type: "transition.latch",
      step: step,
    });

    if (enabled != null) {
      return this._instant(enabled);
    }
  }

  slideStep(index, step) {
    //console.log 'slide:step', @node.toString(), index, step
    return this.trigger({
      type: "slide.step",
      index: index,
      step: step,
    });
  }

  slideRelease() {
    //console.log 'slide:release', @node.toString()
    return this.trigger({
      type: "transition.release",
    });
  }

  slideReset() {
    this._instant(false);
    return this.trigger({
      type: "slide.reset",
    });
  }

  _instant(enabled) {
    //console.log 'slide:instant', @node.toString(), enabled
    this.setVisible(enabled);
    return this.setActive(enabled);
  }
}
Slide.initClass();

// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Transition } from "./transition.js";

export class Move extends Transition {
  static initClass() {
    this.traits = ["node", "transition", "vertex", "move", "visible", "active"];
  }

  make() {
    super.make();

    const object = {
      moveFrom: this.node.attributes["move.from"],
      moveTo: this.node.attributes["move.to"],
    };
    for (let k in object) {
      const v = object[k];
      this.uniforms[k] = v;
    }
  }

  vertex(shader, pass) {
    let left;
    if (pass === this.props.pass) {
      shader.pipe("move.position", this.uniforms);
    }
    return (left = __guard__(this._inherit("vertex"), (x) =>
      x.vertex(shader, pass)
    )) != null
      ? left
      : shader;
  }
}
Move.initClass();

function __guard__(value, transform) {
  return typeof value !== "undefined" && value !== null
    ? transform(value)
    : undefined;
}

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
import { Parent } from "../base/parent";

export class Transform extends Parent {
  static initClass() {
    this.traits = ["node", "vertex", "fragment"];
  }

  vertex(shader, pass) {
    let left;
    return (left = __guard__(this._inherit("vertex"), (x) =>
      x.vertex(shader, pass)
    )) != null
      ? left
      : shader;
  }

  fragment(shader, pass) {
    let left;
    return (left = __guard__(this._inherit("fragment"), (x) =>
      x.fragment(shader, pass)
    )) != null
      ? left
      : shader;
  }
}
Transform.initClass();

function __guard__(value, xform) {
  return typeof value !== "undefined" && value !== null
    ? xform(value)
    : undefined;
}

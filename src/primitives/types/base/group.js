// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Parent } from "./parent.js";

export class Group extends Parent {
  static initClass() {
    this.traits = ["node", "object", "entity", "visible", "active"];
  }

  make() {
    this._helpers.visible.make();
    return this._helpers.active.make();
  }

  unmake() {
    this._helpers.visible.unmake();
    return this._helpers.active.unmake();
  }
}
Group.initClass();

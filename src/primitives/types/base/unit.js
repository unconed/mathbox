// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Parent } from "./parent";

export class Unit extends Parent {
  static initClass() {
    this.traits = ["node", "unit"];
  }

  make() {
    return this._helpers.unit.make();
  }
  unmake() {
    return this._helpers.unit.unmake();
  }

  getUnit() {
    return this._helpers.unit.get();
  }
  getUnitUniforms() {
    return this._helpers.unit.uniforms();
  }
}
Unit.initClass();

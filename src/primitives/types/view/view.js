// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import { Transform } from "../transform/transform";

export class View extends Transform {
  static initClass() {
    this.traits = ["node", "object", "visible", "view", "vertex"];
  }

  make() {
    return this._helpers.visible.make();
  }

  unmake() {
    return this._helpers.visible.unmake();
  }

  axis(dimension) {
    return this.props.range[dimension - 1];
  }
}
View.initClass();

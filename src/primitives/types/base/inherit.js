// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Parent } from "./parent.js";

export class Inherit extends Parent {
  static initClass() {
    this.traits = ["node", "bind"];
  }

  make() {
    // Bind to attached trait source
    return this._helpers.bind.make([{ to: "inherit.source", trait: "node" }]);
  }

  unmake() {
    return this._helpers.bind.unmake();
  }

  _find(trait) {
    if (this.bind.source && Array.from(this.props.traits).includes(trait)) {
      return this.bind.source._inherit(trait);
    }
    return super._find();
  }
}
Inherit.initClass();

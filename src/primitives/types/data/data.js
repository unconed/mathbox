// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UData from "../../../util/data.js";
import { Source } from "../base/source.js";

export class Data extends Source {
  static initClass() {
    this.traits = ["node", "data", "source", "index", "entity", "active"];
  }

  init() {
    this.dataEmitter = null;
    return (this.dataSizes = null);
  }

  emitter(channels, items) {
    let emitter;
    const { data } = this.props;
    const { bind } = this.props;
    const { expr } = this.props;

    if (data != null) {
      // Make new emitter if data geometry doesn't match
      const last = this.dataSizes;
      const sizes = UData.getSizes(data);

      if (!last || last.length !== sizes.length) {
        // Create data thunk to copy (multi-)array
        const thunk = UData.getThunk(data);
        this.dataEmitter = this.callback(
          UData.makeEmitter(thunk, items, channels)
        );
        this.dataSizes = sizes;
      }

      emitter = this.dataEmitter;
    } else if (resolve != null) {
      // Hook up data-bound expression to its source
      var resolve = this._inherit("resolve");
      emitter = this.callback(resolve.callback(bind));
    } else if (expr != null) {
      // Convert given free expression to appropriate callback
      emitter = this.callback(expr);
    } else {
      // Passthrough
      emitter = this.callback(this.passthrough);
    }

    return emitter;
  }

  callback(callback) {
    return callback != null ? callback : function () {};
  }

  update() {}

  make() {
    this._helpers.active.make();

    // Always run update at least once to prime JS VM optimization for entering elements
    this.first = true;
    return this._listen("root", "root.update", () => {
      if (this.isActive || this.first) {
        this.update();
      }
      return (this.first = false);
    });
  }

  unmake() {
    this._helpers.active.unmake();

    this.dataEmitter = null;
    return (this.dataSizes = null);
  }
}
Data.initClass();

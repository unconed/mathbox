import { Parent } from "../base/parent.js";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/eqDeep";

class Latch extends Parent {
  static initClass() {
    this.traits = ["node", "entity", "active", "latch"];
  }

  init() {
    this.data = undefined;
    this.isDirty = true;
  }

  make() {
    this._helpers.active.make();

    this._listen("root", "root.update", function () {
      if (this.isActive) {
        this.update();
      }
    });
  }

  unmake() {
    this._helpers.active.unmake();
    this.data = undefined;
  }

  swap() {
    const { deep, data } = this.props;
    const dirty = deep ? !isEqual(data, this.data) : data != this.data;
    if (dirty) {
      this.data = deep ? cloneDeep(data) : data;
    }
  }

  update() {
    this.isDirty = this.swap();
  }
}
Latch.initClass();

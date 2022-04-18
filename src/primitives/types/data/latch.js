import { Parent } from "../base/parent.js";

function clone(x) {
  return x && JSON.parse(JSON.stringify(x));
}

function deepEq(a, b) {
  return JSON.stringify(a) == JSON.stringify(b);
}

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
    const dirty = deep ? !deepEq(data, this.data) : data != this.data;
    if (dirty) {
      this.data = deep ? clone(data) : data;
    }
  }

  update() {
    this.isDirty = this.swap();
  }
}
Latch.initClass();

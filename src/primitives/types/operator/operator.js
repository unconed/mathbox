// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Source } from "../base/source";

export class Operator extends Source {
  static initClass() {
    this.traits = ["node", "bind", "operator", "source", "index"];
  }

  indexShader(shader) {
    return __guardMethod__(this.bind.source, "indexShader", (o) =>
      o.indexShader(shader)
    );
  }
  sourceShader(shader) {
    return __guardMethod__(this.bind.source, "sourceShader", (o) =>
      o.sourceShader(shader)
    );
  }

  getDimensions() {
    return this.bind.source.getDimensions();
  }
  getFutureDimensions() {
    return this.bind.source.getFutureDimensions();
  }
  getActiveDimensions() {
    return this.bind.source.getActiveDimensions();
  }
  getIndexDimensions() {
    return this.bind.source.getIndexDimensions();
  }

  init() {
    return (this.sourceSpec = [
      { to: "operator.source", trait: "source", optional: true },
    ]);
  }

  make() {
    super.make();

    // Bind to attached data sources
    return this._helpers.bind.make(this.sourceSpec);
  }

  made() {
    this.resize();
    return super.made();
  }

  unmake() {
    return this._helpers.bind.unmake();
  }

  resize(_rebuild) {
    return this.trigger({
      type: "source.resize",
    });
  }
}
Operator.initClass();

function __guardMethod__(obj, methodName, transform) {
  if (
    typeof obj !== "undefined" &&
    obj !== null &&
    typeof obj[methodName] === "function"
  ) {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}

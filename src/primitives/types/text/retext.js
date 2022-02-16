// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Resample } from "../operator/resample.js";

export class Retext extends Resample {
  static initClass() {
    this.traits = [
      "node",
      "bind",
      "operator",
      "resample",
      "sampler:x",
      "sampler:y",
      "sampler:z",
      "sampler:w",
      "include",
      "text",
    ];
  }

  init() {
    return (this.sourceSpec = [{ to: "operator.source", trait: "text" }]);
  }

  textShader(shader) {
    return this.bind.source.textShader(shader);
  }

  textIsSDF() {
    return (
      (this.bind.source != null ? this.bind.source.props.sdf : undefined) > 0
    );
  }
  textHeight() {
    return this.bind.source != null ? this.bind.source.props.detail : undefined;
  }
}
Retext.initClass();

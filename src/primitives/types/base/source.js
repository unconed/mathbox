// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as GLSL from "../../../util/glsl";
import { Primitive } from "../../primitive";

export class Source extends Primitive {
  static initClass() {
    this.traits = ["node", "source", "index"];
  }

  made() {
    // Notify of buffer reallocation
    return this.trigger({
      type: "source.rebuild",
    });
  }

  indexShader(shader) {
    return shader.pipe(GLSL.identity("vec4"));
  }
  sourceShader(shader) {
    return shader.pipe(GLSL.identity("vec4"));
  }

  getDimensions() {
    return {
      items: 1,
      width: 1,
      height: 1,
      depth: 1,
    };
  }

  getActiveDimensions() {
    return this.getDimensions();
  }

  getIndexDimensions() {
    return this.getActiveDimensions();
  }
  getFutureDimensions() {
    return this.getActiveDimensions();
  }
}
Source.initClass();

// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as UGLSL from "../../../util/glsl.js";
import { Transition } from "./transition.js";
export class Reveal extends Transition {
    static initClass() {
        this.traits = ["node", "transition", "mask", "visible", "active"];
    }
    mask(shader) {
        let left, s;
        if (shader) {
            s = this._shaders.shader();
            s.pipe(UGLSL.identity("vec4"));
            s.fan();
            s.pipe(shader, this.uniforms);
            s.next();
            s.pipe("reveal.mask", this.uniforms);
            s.end();
            s.pipe("float combine(float a, float b) { return min(a, b); }");
        }
        else {
            s = this._shaders.shader();
            s.pipe("reveal.mask", this.uniforms);
        }
        return (left = __guard__(this._inherit("mask"), (x) => x.mask(s))) != null
            ? left
            : s;
    }
}
Reveal.initClass();
function __guard__(value, transform) {
    return typeof value !== "undefined" && value !== null
        ? transform(value)
        : undefined;
}

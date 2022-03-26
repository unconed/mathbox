// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as UAxis from "../../../util/axis.js";
import { Source } from "../base/source.js";
export class Scale extends Source {
    static initClass() {
        this.traits = [
            "node",
            "source",
            "index",
            "interval",
            "span",
            "scale",
            "raw",
            "origin",
        ];
    }
    init() {
        return (this.used = this.space = this.scaleAxis = this.sampler = null);
    }
    rawBuffer() {
        return this.buffer;
    }
    sourceShader(shader) {
        return shader.pipe(this.sampler);
    }
    getDimensions() {
        return {
            items: 1,
            width: this.space,
            height: 1,
            depth: 1,
        };
    }
    getActiveDimensions() {
        return {
            items: 1,
            width: this.used,
            height: this.buffer.getFilled(),
            depth: 1,
        };
    }
    getRawDimensions() {
        return this.getDimensions();
    }
    make() {
        // Prepare data buffer of tick positions
        let samples;
        this.space = samples = this._helpers.scale.divide("");
        this.buffer = this._renderables.make("dataBuffer", {
            width: samples,
            channels: 1,
            items: 1,
        });
        // Prepare position shader
        const positionUniforms = {
            scaleAxis: this._attributes.make(this._types.vec4()),
            scaleOffset: this._attributes.make(this._types.vec4()),
        };
        this.scaleAxis = positionUniforms.scaleAxis.value;
        this.scaleOffset = positionUniforms.scaleOffset.value;
        // Build sampler
        const p = (this.sampler = this._shaders.shader());
        // Require buffer sampler as callback
        p.require(this.buffer.shader(this._shaders.shader(), 1));
        // Shader to expand scalars to 4D vector on an axis.
        p.pipe("scale.position", positionUniforms);
        this._helpers.span.make();
        // Monitor view range
        return this._listen(this, "span.range", this.updateRanges);
    }
    unmake() {
        this.scaleAxis = null;
        return this._helpers.span.unmake();
    }
    change(changed, touched, init) {
        if (changed["scale.divide"]) {
            return this.rebuild();
        }
        if (touched["view"] ||
            touched["interval"] ||
            touched["span"] ||
            touched["scale"] ||
            init) {
            return this.updateRanges();
        }
    }
    updateRanges() {
        const { used } = this;
        // Fetch range along axis
        const { axis, origin } = this.props;
        const range = this._helpers.span.get("", axis);
        // Calculate scale along axis
        const min = range.x;
        const max = range.y;
        const ticks = this._helpers.scale.generate("", this.buffer, min, max);
        UAxis.setDimension(this.scaleAxis, axis);
        UAxis.setOrigin(this.scaleOffset, axis, origin);
        // Clip to number of ticks
        this.used = ticks.length;
        // Notify of resize
        if (this.used !== used) {
            return this.trigger({
                type: "source.resize",
            });
        }
    }
}
Scale.initClass();

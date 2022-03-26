// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as UGLSL from "../../../util/glsl.js";
import { Operator } from "./operator.js";
export class Subdivide extends Operator {
    static initClass() {
        this.traits = ["node", "bind", "operator", "source", "index", "subdivide"];
    }
    indexShader(shader) {
        shader.pipe(this.indexer);
        return super.indexShader(shader);
    }
    sourceShader(shader) {
        return shader.pipe(this.operator);
    }
    getDimensions() {
        return this._resample(this.bind.source.getDimensions());
    }
    getActiveDimensions() {
        return this._resample(this.bind.source.getActiveDimensions());
    }
    getFutureDimensions() {
        return this._resample(this.bind.source.getFutureDimensions());
    }
    getIndexDimensions() {
        return this._resample(this.bind.source.getIndexDimensions());
    }
    _resample(dims) {
        const r = this.resampled;
        dims.items--;
        dims.width--;
        dims.height--;
        dims.depth--;
        if (r.items != null) {
            dims.items *= r.items;
        }
        if (r.width != null) {
            dims.width *= r.width;
        }
        if (r.height != null) {
            dims.height *= r.height;
        }
        if (r.depth != null) {
            dims.depth *= r.depth;
        }
        dims.items++;
        dims.width++;
        dims.height++;
        dims.depth++;
        return dims;
    }
    make() {
        super.make();
        if (this.bind.source == null) {
            return;
        }
        // Get resampled dimensions
        let { lerp } = this.props;
        const { items, width, height, depth } = this.props;
        this.resampled = {};
        if (items != null) {
            this.resampled.items = items;
        }
        if (width != null) {
            this.resampled.width = width;
        }
        if (height != null) {
            this.resampled.height = height;
        }
        if (depth != null) {
            this.resampled.depth = depth;
        }
        // Build shader to resample data
        const operator = this._shaders.shader();
        const indexer = this._shaders.shader();
        // Uniforms
        const uniforms = {
            resampleFactor: this._attributes.make(this._types.vec4(0, 0, 0, 0)),
            subdivideBevel: this.node.attributes["subdivide.bevel"],
        };
        this.resampleFactor = uniforms.resampleFactor;
        this.resampleBias = uniforms.resampleBias;
        // Has resize props?
        const resize = items != null || width != null || height != null || depth != null;
        // Addressing relative to target
        if (resize) {
            operator.pipe("resample.relative", uniforms);
            indexer.pipe("resample.relative", uniforms);
        }
        else {
            operator.pipe(UGLSL.identity("vec4"));
            indexer.pipe(UGLSL.identity("vec4"));
        }
        // Make sampler
        let sampler = this.bind.source.sourceShader(this._shaders.shader());
        lerp = lerp ? ".lerp" : "";
        // Iterate over dimensions (items, width, height, depth)
        const iterable = ["width", "height", "depth", "items"];
        for (let i = 0; i < iterable.length; i++) {
            const key = iterable[i];
            const id = `subdivide.${key}${lerp}`;
            if (this.props[key] != null) {
                sampler = this._shaders.shader().require(sampler);
                sampler.pipe(id, uniforms);
            }
        }
        // Combine operator and composite lerp sampler
        operator.pipe(sampler);
        this.operator = operator;
        return (this.indexer = indexer);
    }
    unmake() {
        super.unmake();
        return (this.operator = null);
    }
    resize() {
        if (this.bind.source == null) {
            return;
        }
        const dims = this.bind.source.getActiveDimensions();
        const target = this.getActiveDimensions();
        const axis = (key) => Math.max(1, dims[key] - 1) / Math.max(1, target[key] - 1);
        const rw = axis("width");
        const rh = axis("height");
        const rd = axis("depth");
        const ri = axis("items");
        this.resampleFactor.value.set(rw, rh, rd, ri);
        return super.resize();
    }
    change(changed, touched, _init) {
        if (touched["operator"] || touched["subdivide"]) {
            return this.rebuild();
        }
    }
}
Subdivide.initClass();

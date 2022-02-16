// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UGLSL from "../../../util/glsl.js";
import { Operator } from "./operator.js";

export class Resample extends Operator {
  static initClass() {
    this.traits = [
      "node",
      "bind",
      "operator",
      "source",
      "index",
      "resample",
      "sampler:x",
      "sampler:y",
      "sampler:z",
      "sampler:w",
      "include",
    ];
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
    const c = this.centered;
    const p = this.padding;

    if (this.relativeSize) {
      if (!c.items) {
        dims.items--;
      }
      if (!c.width) {
        dims.width--;
      }
      if (!c.height) {
        dims.height--;
      }
      if (!c.depth) {
        dims.depth--;
      }

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

      if (!c.items) {
        dims.items++;
      }
      if (!c.width) {
        dims.width++;
      }
      if (!c.height) {
        dims.height++;
      }
      if (!c.depth) {
        dims.depth++;
      }

      dims.items -= p.items * 2;
      dims.width -= p.width * 2;
      dims.height -= p.height * 2;
      dims.depth -= p.depth * 2;
    } else {
      if (r.items != null) {
        dims.items = r.items;
      }
      if (r.width != null) {
        dims.width = r.width;
      }
      if (r.height != null) {
        dims.height = r.height;
      }
      if (r.depth != null) {
        dims.depth = r.depth;
      }
    }

    dims.items = Math.max(0, Math.floor(dims.items));
    dims.width = Math.max(0, Math.floor(dims.width));
    dims.height = Math.max(0, Math.floor(dims.height));
    dims.depth = Math.max(0, Math.floor(dims.depth));

    return dims;
  }

  make() {
    super.make();
    if (this.bind.source == null) {
      return;
    }

    // Bind to attached shader
    this._helpers.bind.make([
      { to: "include.shader", trait: "shader", optional: true },
    ]);

    // Get custom shader
    const { indices, channels } = this.props;
    const { shader } = this.bind;

    // Get resampled dimensions (if any)
    const { sample, size, items, width, height, depth } = this.props;

    // Sampler behavior
    const relativeSample =
      sample === this.node.attributes["resample.sample"].enum.relative;
    const relativeSize =
      size === this.node.attributes["resample.size"].enum.relative;

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

    this.centered = {};
    this.centered.items = this.props.centeredW;
    this.centered.width = this.props.centeredX;
    this.centered.height = this.props.centeredY;
    this.centered.depth = this.props.centeredZ;

    this.padding = {};
    this.padding.items = this.props.paddingW;
    this.padding.width = this.props.paddingX;
    this.padding.height = this.props.paddingY;
    this.padding.depth = this.props.paddingZ;

    // Build shader to resample data
    const operator = this._shaders.shader();
    const indexer = this._shaders.shader();

    // Uniforms
    const type = [
      null,
      this._types.number,
      this._types.vec2,
      this._types.vec3,
      this._types.vec4,
    ][indices];
    const uniforms = {
      dataSize: this._attributes.make(type(0, 0, 0, 0)),
      dataResolution: this._attributes.make(type(0, 0, 0, 0)),

      targetSize: this._attributes.make(type(0, 0, 0, 0)),
      targetResolution: this._attributes.make(type(0, 0, 0, 0)),

      resampleFactor: this._attributes.make(this._types.vec4(0, 0, 0, 0)),
      resampleBias: this._attributes.make(this._types.vec4(0, 0, 0, 0)),
    };

    this.dataResolution = uniforms.dataResolution;
    this.dataSize = uniforms.dataSize;
    this.targetResolution = uniforms.targetResolution;
    this.targetSize = uniforms.targetSize;
    this.resampleFactor = uniforms.resampleFactor;
    this.resampleBias = uniforms.resampleBias;

    // Has resize props?
    const resize =
      items != null || width != null || height != null || depth != null;

    // Add padding
    operator.pipe("resample.padding", uniforms);

    // Add centered sampling offset
    let vec = [];
    let any = false;
    const iterable = ["width", "height", "depth", "items"];
    for (let i = 0; i < iterable.length; i++) {
      const key = iterable[i];
      const centered = this.centered[key];
      if (!any) {
        any = centered;
      }
      vec[i] = centered ? "0.5" : "0.0";
    }

    if (any) {
      vec = `vec4(${vec})`;
      // TODO is this right? seems like copy paste.
      operator.pipe(UGLSL.binaryOperator(4, "+", vec));
      if (resize) {
        indexer.pipe(UGLSL.binaryOperator(4, "+", vec));
      }
    }

    if (relativeSample) {
      // Addressing relative to target
      if (resize) {
        operator.pipe("resample.relative", uniforms);
        indexer.pipe("resample.relative", uniforms);
      } else {
        indexer.pipe(UGLSL.identity("vec4"));
      }
    }

    if (shader != null) {
      if (indices !== 4) {
        operator.pipe(UGLSL.truncateVec(4, indices));
      }

      operator.callback();
      if (indices !== 4) {
        operator.pipe(UGLSL.extendVec(indices, 4));
      }
      if (any) {
        operator.pipe(UGLSL.binaryOperator(4, "-", vec));
      }
      operator.pipe(this.bind.source.sourceShader(this._shaders.shader()));
      if (channels !== 4) {
        operator.pipe(UGLSL.truncateVec(4, channels));
      }
      operator.join();

      if (this.bind.shader != null) {
        operator.pipe(this.bind.shader.shaderBind(uniforms));
      }

      if (channels !== 4) {
        operator.pipe(UGLSL.extendVec(channels, 4));
      }
    } else {
      if (any) {
        operator.pipe(UGLSL.binaryOperator(4, "-", vec));
      }
      operator.pipe(this.bind.source.sourceShader(this._shaders.shader()));
    }

    if (any && resize) {
      indexer.pipe(UGLSL.binaryOperator(4, "-", vec));
    }

    this.operator = operator;
    this.indexer = indexer;
    this.indices = indices;

    this.relativeSample = relativeSample;
    return (this.relativeSize = relativeSize);
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

    const axis = (key) => {
      const centered = this.centered[key];
      const pad = this.padding[key];

      target[key] += pad * 2;

      const res = centered
        ? dims[key] / Math.max(1, target[key])
        : Math.max(1, dims[key] - 1) / Math.max(1, target[key] - 1);
      return [res, pad];
    };

    const [rw, bw] = Array.from(axis("width"));
    const [rh, bh] = Array.from(axis("height"));
    const [rd, bd] = Array.from(axis("depth"));
    const [ri, bi] = Array.from(axis("items"));

    if (this.indices === 1) {
      this.dataResolution.value = 1 / dims.width;
      this.targetResolution.value = 1 / target.width;

      this.dataSize.value = dims.width;
      this.targetSize.value = target.width;
    } else {
      this.dataResolution.value.set(
        1 / dims.width,
        1 / dims.height,
        1 / dims.depth,
        1 / dims.items
      );
      this.targetResolution.value.set(
        1 / target.width,
        1 / target.height,
        1 / target.depth,
        1 / target.items
      );

      this.dataSize.value.set(dims.width, dims.height, dims.depth, dims.items);
      this.targetSize.value.set(
        target.width,
        target.height,
        target.depth,
        target.items
      );
    }

    this.resampleFactor.value.set(rw, rh, rd, ri);
    this.resampleBias.value.set(bw, bh, bd, bi);

    return super.resize();
  }

  change(changed, touched, _init) {
    if (
      touched["operator"] ||
      touched["resample"] ||
      touched["sampler"] ||
      touched["include"]
    ) {
      return this.rebuild();
    }
  }
}
Resample.initClass();

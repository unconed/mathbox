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

export class Lerp extends Operator {
  static initClass() {
    this.traits = [
      "node",
      "bind",
      "operator",
      "source",
      "index",
      "lerp",
      "sampler:x",
      "sampler:y",
      "sampler:z",
      "sampler:w",
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
    let i, key;
    super.make();
    if (this.bind.source == null) {
      return;
    }

    // Get resampled dimensions
    const { size, items, width, height, depth } = this.props;

    // Sampler behavior
    const relativeSize =
      size === this.node.attributes["lerp.size"].enum.relative;

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
    const uniforms = {
      resampleFactor: this._attributes.make(this._types.vec4(0, 0, 0, 0)),
      resampleBias: this._attributes.make(this._types.vec4(0, 0, 0, 0)),
    };

    this.resampleFactor = uniforms.resampleFactor;
    this.resampleBias = uniforms.resampleBias;

    // Has resize props?
    const resize =
      items != null || width != null || height != null || depth != null;

    // Add padding
    operator.pipe("resample.padding", uniforms);

    // Prepare centered sampling offset
    let vec = [];
    let any = false;
    const iterable = ["width", "height", "depth", "items"];
    for (i = 0; i < iterable.length; i++) {
      key = iterable[i];
      const centered = this.centered[key];
      if (!any) {
        any = centered;
      }
      vec[i] = centered ? "0.5" : "0.0";
    }

    // Add centered sampling offset (from source)
    if (any && resize) {
      vec = `vec4(${vec})`;
      // TODO is this right? it was vec4 before.
      operator.pipe(UGLSL.binaryOperator(4, "+", vec));
      indexer.pipe(UGLSL.binaryOperator(4, "+", vec));
    }

    // Addressing relative to target
    if (resize) {
      operator.pipe("resample.relative", uniforms);
      indexer.pipe("resample.relative", uniforms);
    } else {
      operator.pipe(UGLSL.identity("vec4"));
      indexer.pipe(UGLSL.identity("vec4"));
    }

    // Remove centered sampling offset (to target)
    if (any && resize) {
      operator.pipe(UGLSL.binaryOperator(4, "-", vec));
      indexer.pipe(UGLSL.binaryOperator(4, "-", vec));
    }

    // Make sampler
    let sampler = this.bind.source.sourceShader(this._shaders.shader());

    // Iterate over dimensions (items, width, height, depth)
    const iterable1 = ["width", "height", "depth", "items"];
    for (i = 0; i < iterable1.length; i++) {
      key = iterable1[i];
      const id = `lerp.${key}`;

      if (this.props[key] != null) {
        sampler = this._shaders.shader().require(sampler);
        sampler.pipe(id, uniforms);
      }
    }

    // Combine operator and composite lerp sampler
    operator.pipe(sampler);

    this.operator = operator;
    this.indexer = indexer;

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

    this.resampleFactor.value.set(rw, rh, rd, ri);
    this.resampleBias.value.set(bw, bh, bd, bi);

    return super.resize();
  }

  change(changed, touched, _init) {
    if (touched["operator"] || touched["lerp"] || touched["sampler"]) {
      return this.rebuild();
    }
  }
}
Lerp.initClass();

// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UGLSL from "../../util/glsl.js";

import { RawShaderMaterial } from "three";
import { Renderable } from "../renderable.js";

export class Base extends Renderable {
  constructor(renderer, shaders, options) {
    super(renderer, shaders, options);
    this.zUnits = options.zUnits != null ? options.zUnits : 0;
  }

  raw() {
    for (const object of Array.from(this.renders)) {
      this._raw(object);
    }
    return null;
  }

  depth(write, test) {
    for (const object of Array.from(this.renders)) {
      this._depth(object, write, test);
    }
    return null;
  }

  polygonOffset(factor, units) {
    for (const object of Array.from(this.renders)) {
      this._polygonOffset(object, factor, units);
    }
    return null;
  }

  show(transparent, blending, order) {
    return Array.from(this.renders).map((object) =>
      this._show(object, transparent, blending, order)
    );
  }

  hide() {
    for (const object of Array.from(this.renders)) {
      this._hide(object);
    }
    return null;
  }

  _injectPreamble(preamble, code) {
    const program = preamble + "\n" + code;
    if (code.match(/#extension/)) {
      return this._hoist(program);
    } else {
      return program;
    }
  }

  _hoist(code) {
    const lines = code.split("\n");
    const out = [];
    for (const line of Array.from(lines)) {
      if (line.match(/^\s*#extension/)) {
        out.unshift(line);
      } else {
        out.push(line);
      }
    }
    return out.join("\n");
  }

  _material(options) {
    const precision = this.renderer.capabilities.precision;

    const vertexPrefix = `\
    precision ${precision} float;
    precision ${precision} int;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;\
`;

    const fragmentPrefix = `\
    precision ${precision} float;
    precision ${precision} int;
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;\
`;

    const shaderOptions = {};
    Object.assign(shaderOptions, options);
    delete shaderOptions.attributes;
    delete shaderOptions.varyings;
    delete shaderOptions.inspect;
    delete shaderOptions.vertexGraph;
    delete shaderOptions.fragmentGraph;

    const material = new RawShaderMaterial(shaderOptions);

    ["vertexGraph", "fragmentGraph", "inspect"].forEach(
      (key) => (material[key] = options[key])
    );

    material.vertexShader = this._injectPreamble(
      vertexPrefix,
      material.vertexShader
    );
    material.fragmentShader = this._injectPreamble(
      fragmentPrefix,
      material.fragmentShader
    );
    return material;
  }

  _raw(object) {
    object.rotationAutoUpdate = false;
    object.frustumCulled = false;
    object.matrixAutoUpdate = false;
    object.material.defaultAttributeValues = undefined;
  }

  _depth(object, write, test) {
    const m = object.material;
    m.depthWrite = write;
    return (m.depthTest = test);
  }

  _polygonOffset(object, factor, units) {
    units -= this.zUnits;
    const enabled = units !== 0;

    const m = object.material;

    m.polygonOffset = enabled;
    if (enabled) {
      m.polygonOffsetFactor = factor;
      return (m.polygonOffsetUnits = units);
    }
  }

  _show(object, transparent, blending, order) {
    // Force transparent to true to ensure all renderables drawn in order
    transparent = true;

    const m = object.material;

    object.renderOrder = -order;
    object.visible = true;
    m.transparent = transparent;
    m.blending = blending;

    return null;
  }

  _hide(object) {
    return (object.visible = false);
  }

  _vertexColor(color, mask) {
    if (!color && !mask) {
      return;
    }

    const v = this.shaders.shader();

    if (color) {
      v.require(color);
      v.pipe("mesh.vertex.color", this.uniforms);
    }

    if (mask) {
      v.require(mask);
      v.pipe("mesh.vertex.mask", this.uniforms);
    }

    return v;
  }

  _vertexPosition(position, material, map, channels, stpq) {
    let defs;
    const v = this.shaders.shader();

    if (map || (material && material !== true)) {
      defs = {};
      if (channels > 0 || stpq) {
        defs.POSITION_MAP = "";
      }
      if (channels > 0) {
        defs[
          ["POSITION_U", "POSITION_UV", "POSITION_UVW", "POSITION_UVWO"][
            channels - 1
          ]
        ] = "";
      }
      if (stpq) {
        defs.POSITION_STPQ = "";
      }
    }

    v.require(position);
    return v.pipe("mesh.vertex.position", this.uniforms, defs);
  }

  _fragmentColor(
    hasStyle,
    material,
    color,
    mask,
    map,
    channels,
    stpq,
    combine,
    linear
  ) {
    const f = this.shaders.shader();

    // metacode is terrible
    let join = false;
    let gamma = false;

    const defs = {};
    if (channels > 0) {
      defs[
        ["POSITION_U", "POSITION_UV", "POSITION_UVW", "POSITION_UVWO"][
          channels - 1
        ]
      ] = "";
    }
    if (stpq) {
      defs.POSITION_STPQ = "";
    }

    if (hasStyle) {
      f.pipe("style.color", this.uniforms);
      join = true;

      if (color || map || material) {
        if (!linear || color) {
          f.pipe("mesh.gamma.in");
        }
        gamma = true;
      }
    }

    if (color) {
      f.isolate();
      f.pipe("mesh.fragment.color", this.uniforms);
      if (!linear || join) {
        f.pipe("mesh.gamma.in");
      }
      f.end();
      if (join) {
        f.pipe(UGLSL.binaryOperator("vec4", "*"));
      }

      if (linear && join) {
        f.pipe("mesh.gamma.out");
      }

      join = true;
      gamma = true;
    }

    if (map) {
      if (!join && combine) {
        f.pipe(UGLSL.constant("vec4", "vec4(1.0)"));
      }

      f.isolate();
      f.require(map);
      f.pipe("mesh.fragment.map", this.uniforms, defs);
      if (!linear) {
        f.pipe("mesh.gamma.in");
      }
      f.end();

      if (combine) {
        f.pipe(combine);
      } else {
        if (join) {
          f.pipe(UGLSL.binaryOperator("vec4", "*"));
        }
      }

      join = true;
      gamma = true;
    }

    if (material) {
      if (!join) {
        f.pipe(UGLSL.constant("vec4", "vec4(1.0)"));
      }
      if (material === true) {
        f.pipe("mesh.fragment.shaded", this.uniforms);
      } else {
        f.require(material);
        f.pipe("mesh.fragment.material", this.uniforms, defs);
      }

      gamma = true;
    }

    if (gamma && !linear) {
      f.pipe("mesh.gamma.out");
    }

    if (mask) {
      f.pipe("mesh.fragment.mask", this.uniforms);
      if (join) {
        f.pipe(UGLSL.binaryOperator("vec4", "*"));
      }
    }

    return f;
  }
}

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
import { Primitive } from "../../primitive.js";

export class Shader extends Primitive {
  static initClass() {
    this.traits = ["node", "bind", "shader"];
    this.freeform = true;
  }

  init() {
    return (this.shader = null);
  }

  make() {
    const { language, code } = this.props;
    if (language !== "glsl") {
      throw new Error("GLSL required");
    }

    // Bind to attached data sources
    this._helpers.bind.make([
      { to: "shader.sources", trait: "source", multiple: true },
    ]);

    // Parse snippet w/ shadergraph (will do implicit DOM script tag by ID
    // lookup if simple selector or ID given)
    const snippet = this._shaders.fetch(code);

    // Convert uniforms to attributes
    const types = this._types;
    const uniforms = {};
    var make = (type) => {
      switch (type) {
        case "i":
          return types.int();
        case "f":
          return types.number();
        case "v2":
          return types.vec2();
        case "v3":
          return types.vec3();
        case "v4":
          return types.vec4();
        case "m3":
          return types.mat3();
        case "m4":
          return types.mat4();
        case "t":
          return types.object();
        default:
          var t = type.split("");
          if (t.pop() === "v") {
            return types.array(make(t.join("")));
          } else {
            return null;
          }
      }
    };

    for (let def of Array.from(snippet._signatures.uniform)) {
      var type;
      if ((type = make(def.type))) {
        uniforms[def.name] = type;
      }
    }

    // Reconfigure node model
    return this.reconfigure({ props: { uniform: uniforms } });
  }

  made() {
    // Notify of shader reallocation
    return this.trigger({
      type: "source.rebuild",
    });
  }

  unmake() {
    return (this.shader = null);
  }

  change(changed, _touched, _init) {
    if (
      changed["shader.uniforms"] ||
      changed["shader.code"] ||
      changed["shader.language"]
    ) {
      return this.rebuild();
    }
  }

  shaderBind(uniforms) {
    let k, u, v;
    if (uniforms == null) {
      uniforms = {};
    }
    const { code } = this.props;

    // Merge in prop attributes as uniforms
    for (k in this.node.attributes) {
      v = this.node.attributes[k];
      if (v.type != null && v.short != null && v.ns === "uniform") {
        if (uniforms[v.short] == null) {
          uniforms[v.short] = v;
        }
      }
    }

    // Merge in explicit uniform object if set
    if ((u = this.props.uniforms) != null) {
      for (k in u) {
        v = u[k];
        uniforms[k] = v;
      }
    }

    // New shader
    const s = this._shaders.shader();

    // Require sources
    if (this.bind.sources != null) {
      for (let source of Array.from(this.bind.sources)) {
        s.require(source.sourceShader(this._shaders.shader()));
      }
    }

    // Build bound shader
    return s.pipe(code, uniforms);
  }
}
Shader.initClass();

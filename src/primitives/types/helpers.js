// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UGLSL from "../../util/glsl.js";
import * as UTicks from "../../util/ticks.js";

import { NormalBlending, Vector2, Vector3 } from "three";

/*

This is the general dumping ground for trait behavior.

Helpers are auto-attached to primitives that have the matching trait

*/

const helpers = {
  bind: {
    make(slots) {
      if (this.bind == null) {
        this.bind = {};
      }
      if (this.bound == null) {
        this.bound = [];
      }

      // Fetch attached objects and bind to them
      // Attach rebuild watcher for DOM changes to bound nodes
      for (const slot of Array.from(slots)) {
        let { callback } = slot;
        const { to, trait, optional, unique, multiple } = slot;

        if (callback == null) {
          callback = this.rebuild;
        }
        const name = to.split(/\./g).pop();
        const selector = this._get(to);

        // Find by selector
        let source = null;
        if (selector != null) {
          let start = this;
          let done = false;
          while (!done) {
            // Keep scanning back until a new node is found
            start = source = this._attach(
              selector,
              trait,
              callback,
              this,
              start,
              optional,
              multiple
            );
            const isUnique =
              unique && (source == null || this.bound.indexOf(source) < 0);
            done = multiple || optional || !unique || isUnique;
          }
        }

        // Monitor source for reallocation / resize
        if (source != null) {
          if (this.resize != null) {
            this._listen(source, "source.resize", this.resize);
          }
          if (callback) {
            this._listen(source, "source.rebuild", callback);
          }

          if (multiple) {
            for (const s of Array.from(source)) {
              this.bound.push(s);
            }
          } else {
            this.bound.push(source);
          }
        }

        this.bind[name] = source;
      }

      return null;
    },

    unmake() {
      if (!this.bind) {
        return;
      }
      delete this.bind;
      return delete this.bound;
    },
  },

  span: {
    make() {
      // Look up nearest view to inherit from
      // Monitor size changes
      this.spanView = this._inherit("view");
      return this._listen("view", "view.range", () =>
        this.trigger({ type: "span.range" })
      );
    },

    unmake() {
      return delete this.spanView;
    },

    get: (function () {
      const def = new Vector2(-1, 1);

      return function (prefix, dimension) {
        // Return literal range
        let left;
        const range = this._get(prefix + "span.range");
        if (range != null) {
          return range;
        }

        // Inherit from view
        return (left =
          this.spanView != null ? this.spanView.axis(dimension) : undefined) !=
          null
          ? left
          : def;
      };
    })(),
  },

  scale: {
    // Divisions to allocate on scale
    divide(prefix) {
      const divide = this._get(prefix + "scale.divide");
      const factor = this._get(prefix + "scale.factor");
      return Math.round((divide * 2.5) / factor);
    },

    // Generate ticks on scale
    generate(prefix, buffer, min, max) {
      const mode = this._get(prefix + "scale.mode");
      const divide = this._get(prefix + "scale.divide");
      const unit = this._get(prefix + "scale.unit");
      const base = this._get(prefix + "scale.base");
      const factor = this._get(prefix + "scale.factor");
      const start = this._get(prefix + "scale.start");
      const end = this._get(prefix + "scale.end");
      const zero = this._get(prefix + "scale.zero");
      const nice = this._get(prefix + "scale.nice");

      const ticks = UTicks.make(
        mode,
        min,
        max,
        divide,
        unit,
        base,
        factor,
        start,
        end,
        zero,
        nice
      );
      buffer.copy(ticks);
      return ticks;
    },
  },

  style: {
    // Return bound style uniforms
    uniforms() {
      return {
        styleColor: this.node.attributes["style.color"],
        styleOpacity: this.node.attributes["style.opacity"],
        styleZBias: this.node.attributes["style.zBias"],
        styleZIndex: this.node.attributes["style.zIndex"],
      };
    },
  },

  arrow: {
    // Return bound arrow style uniforms
    uniforms() {
      const { start } = this.props;
      const { end } = this.props;

      const space = this._attributes.make(
        this._types.number(1.25 / (start + end))
      );
      const style = this._attributes.make(this._types.vec2(+start, +end));
      const size = this.node.attributes["arrow.size"];

      return {
        clipStyle: style,
        clipRange: size,
        clipSpace: space,

        arrowSpace: space,
        arrowSize: size,
      };
    },
  },

  point: {
    // Return bound point style uniforms
    uniforms() {
      return {
        pointSize: this.node.attributes["point.size"],
        pointDepth: this.node.attributes["point.depth"],
      };
    },
  },

  line: {
    // Return bound line style uniforms
    uniforms() {
      return {
        lineWidth: this.node.attributes["line.width"],
        lineDepth: this.node.attributes["line.depth"],
        lineProximity: this.node.attributes["line.proximity"],
      };
    },
  },

  surface: {
    // Return bound surface style uniforms
    uniforms() {
      return {};
    },
  },

  shade: {
    pipeline(shader) {
      if (!this._inherit("fragment")) {
        return shader;
      }
      if (shader == null) {
        shader = this._shaders.shader();
      }
      for (let pass = 0; pass <= 2; pass++) {
        shader = __guard__(this._inherit("fragment"), (x) =>
          x.fragment(shader, pass)
        );
      }
      shader.pipe("fragment.map.rgba");
      return shader;
    },

    normal(shader) {
      shader.pipe(UGLSL.swizzleVec4("xyz"));
      return shader;
    },

    map(shader) {
      if (!shader) {
        return shader;
      }
      return (shader = this._shaders
        .shader()
        .pipe("mesh.map.uvwo")
        .pipe(shader));
    },
  },

  position: {
    pipeline(shader) {
      if (!this._inherit("vertex")) {
        return shader;
      }
      if (shader == null) {
        shader = this._shaders.shader();
      }
      for (let pass = 0; pass <= 3; pass++) {
        shader = __guard__(this._inherit("vertex"), (x) =>
          x.vertex(shader, pass)
        );
      }
      return shader;
    },

    swizzle(shader, order) {
      if (shader) {
        return this._shaders
          .shader()
          .pipe(UGLSL.swizzleVec4(order))
          .pipe(shader);
      }
    },

    swizzle2(shader, order1, order2) {
      if (shader) {
        return this._shaders
          .shader()
          .split()
          .pipe(UGLSL.swizzleVec4(order1))
          .next()
          .pipe(UGLSL.swizzleVec4(order2))
          .join()
          .pipe(shader);
      }
    },
  },

  visible: {
    make() {
      const e = { type: "visible.change" };

      let visible = null;
      this.setVisible = function (vis) {
        if (vis != null) {
          visible = vis;
        }
        return onVisible();
      };

      const onVisible = () => {
        let left;
        const last = this.isVisible;
        let self =
          (left = visible != null ? visible : this._get("object.visible")) !=
          null
            ? left
            : true;
        if (visibleParent != null) {
          if (self) {
            self = visibleParent.isVisible;
          }
        }
        this.isVisible = self;
        if (last !== this.isVisible) {
          return this.trigger(e);
        }
      };

      const visibleParent = this._inherit("visible");
      if (visibleParent) {
        this._listen(visibleParent, "visible.change", onVisible);
      }
      if (this.is("object")) {
        this._listen(this.node, "change:object", onVisible);
      }

      return onVisible();
    },

    unmake() {
      return delete this.isVisible;
    },
  },

  active: {
    make() {
      const e = { type: "active.change" };

      let active = null;
      this.setActive = function (act) {
        if (act != null) {
          active = act;
        }
        return onActive();
      };

      const onActive = () => {
        let left;
        const last = this.isActive;
        let self =
          (left = active != null ? active : this._get("entity.active")) != null
            ? left
            : true;
        if (activeParent != null) {
          if (self) {
            self = activeParent.isActive;
          }
        }
        this.isActive = self;
        if (last !== this.isActive) {
          return this.trigger(e);
        }
      };

      const activeParent = this._inherit("active");
      if (activeParent) {
        this._listen(activeParent, "active.change", onActive);
      }
      if (this.is("entity")) {
        this._listen(this.node, "change:entity", onActive);
      }

      return onActive();
    },

    unmake() {
      return delete this.isActive;
    },
  },

  object: {
    // Generic 3D renderable wrapper, handles the fiddly Three.js bits that require a 'style recalculation'.
    //
    // Pass renderables to nearest root for rendering
    // Track visibility from parent and notify children
    // Track blends / transparency for three.js materials
    make(objects) {
      // Aggregate rendered three objects for reference
      let blending, zOrder;
      if (objects == null) {
        objects = [];
      }
      this.objects = objects;
      this.renders = this.objects.reduce((a, b) => a.concat(b.renders), []);

      const objectScene = this._inherit("scene");

      let opacity = (blending = zOrder = null);

      const hasStyle = Array.from(this.traits).includes("style");
      opacity = 1;
      blending = NormalBlending;
      let zWrite = true;
      let zTest = true;

      if (hasStyle) {
        ({ opacity } = this.props);
        ({ blending } = this.props);
        ({ zOrder } = this.props);
        ({ zWrite } = this.props);
        ({ zTest } = this.props);
      }

      const onChange = (event) => {
        const { changed } = event;
        let refresh = null;
        if (changed["style.opacity"]) {
          refresh = opacity = this.props.opacity;
        }
        if (changed["style.blending"]) {
          refresh = blending = this.props.blending;
        }
        if (changed["style.zOrder"]) {
          refresh = zOrder = this.props.zOrder;
        }
        if (changed["style.zWrite"]) {
          refresh = zWrite = this.props.zWrite;
        }
        if (changed["style.zTest"]) {
          refresh = zTest = this.props.zTest;
        }
        if (refresh != null) {
          return onVisible();
        }
      };

      const onVisible = () => {
        const order = zOrder != null ? -zOrder : this.node.order;

        const visible =
          (this.isVisible != null ? this.isVisible : true) && opacity > 0;

        if (visible) {
          if (hasStyle) {
            return (() => {
              const result = [];
              for (const o of Array.from(this.objects)) {
                o.show(opacity < 1, blending, order);
                result.push(o.depth(zWrite, zTest));
              }
              return result;
            })();
          } else {
            return (() => {
              const result1 = [];
              for (const o of Array.from(this.objects)) {
                result1.push(o.show(true, blending, order));
              }
              return result1;
            })();
          }
        } else {
          return (() => {
            const result2 = [];
            for (const o of Array.from(this.objects)) {
              result2.push(o.hide());
            }
            return result2;
          })();
        }
      };

      this._listen(this.node, "change:style", onChange);
      this._listen(this.node, "reindex", onVisible);
      this._listen(this, "visible.change", onVisible);

      for (const object of Array.from(this.objects)) {
        objectScene.adopt(object);
      }
      return onVisible();
    },

    unmake(dispose) {
      let object;
      if (dispose == null) {
        dispose = true;
      }
      if (!this.objects) {
        return;
      }

      const objectScene = this._inherit("scene");
      for (object of Array.from(this.objects)) {
        objectScene.unadopt(object);
      }
      if (dispose) {
        return (() => {
          const result = [];
          for (object of Array.from(this.objects)) {
            result.push(object.dispose());
          }
          return result;
        })();
      }
    },

    mask() {
      let mask, shader;
      if (!(mask = this._inherit("mask"))) {
        return;
      }
      return (shader = mask.mask(shader));
    },
  },

  unit: {
    make() {
      let focusDepth,
        pixelRatio,
        pixelUnit,
        renderAspect,
        renderHeight,
        renderOdd,
        renderScale,
        renderScaleInv,
        renderWidth,
        viewHeight,
        viewWidth,
        worldUnit;
      let π = Math.PI;

      this.unitUniforms = {
        renderScaleInv: (renderScaleInv = this._attributes.make(
          this._types.number(1)
        )),
        renderScale: (renderScale = this._attributes.make(
          this._types.number(1)
        )),
        renderAspect: (renderAspect = this._attributes.make(
          this._types.number(1)
        )),
        renderWidth: (renderWidth = this._attributes.make(
          this._types.number(0)
        )),
        renderHeight: (renderHeight = this._attributes.make(
          this._types.number(0)
        )),
        viewWidth: (viewWidth = this._attributes.make(this._types.number(0))),
        viewHeight: (viewHeight = this._attributes.make(this._types.number(0))),
        pixelRatio: (pixelRatio = this._attributes.make(this._types.number(1))),
        pixelUnit: (pixelUnit = this._attributes.make(this._types.number(1))),
        worldUnit: (worldUnit = this._attributes.make(this._types.number(1))),
        focusDepth: (focusDepth = this._attributes.make(this._types.number(1))),
        renderOdd: (renderOdd = this._attributes.make(this._types.vec2())),
      };

      const top = new Vector3();
      const bottom = new Vector3();

      const handler = () => {
        let camera, size;
        if ((size = root != null ? root.getSize() : undefined) == null) {
          return;
        }

        π = Math.PI;

        const { scale } = this.props;
        const { fov } = this.props;
        const focus =
          this.props.focus != null
            ? this.props.focus
            : this.inherit("unit").props.focus;

        const isAbsolute = scale === null;

        // Measure live FOV to be able to accurately predict anti-aliasing in
        // perspective
        let measure = 1;
        if ((camera = root != null ? root.getCamera() : undefined)) {
          const m = camera.projectionMatrix;

          // Measure top to bottom
          top.set(0, -0.5, 1).applyMatrix4(m);
          bottom.set(0, 0.5, 1).applyMatrix4(m);
          top.sub(bottom);
          measure = top.y;
        }

        // Calculate device pixel ratio
        const dpr = size.renderHeight / size.viewHeight;

        // Calculate correction for fixed on-screen size regardless of FOV
        const fovtan = fov != null ? measure * Math.tan((fov * π) / 360) : 1;

        // Calculate device pixels per virtual pixel
        const pixel = isAbsolute ? dpr : (size.renderHeight / scale) * fovtan;

        // Calculate device pixels per world unit
        const rscale = (size.renderHeight * measure) / 2;

        // Calculate world units per virtual pixel
        const world = pixel / rscale;

        viewWidth.value = size.viewWidth;
        viewHeight.value = size.viewHeight;
        renderWidth.value = size.renderWidth;
        renderHeight.value = size.renderHeight;
        renderAspect.value = size.aspect;
        renderScale.value = rscale;
        renderScaleInv.value = 1 / rscale;
        pixelRatio.value = dpr;
        pixelUnit.value = pixel;
        worldUnit.value = world;
        focusDepth.value = focus;

        return renderOdd.value
          .set(size.renderWidth % 2, size.renderHeight % 2)
          .multiplyScalar(0.5);
      };

      //console.log 'worldUnit', world, pixel, rscale, isAbsolute

      const root = this.is("root") ? this : this._inherit("root");
      //@_listen root, 'root.resize', handler
      //@_listen root, 'root.camera', handler
      //@_listen @node, 'change:unit', handler
      this._listen(root, "root.update", handler);

      return handler();
    },

    unmake() {
      return delete this.unitUniforms;
    },

    get() {
      const u = {};
      for (const k in this.unitUniforms) {
        const v = this.unitUniforms[k];
        u[k] = v.value;
      }
      return u;
    },

    uniforms() {
      return this.unitUniforms;
    },
  },
};

export const Helpers = function (object, traits) {
  const h = {};
  for (const trait of Array.from(traits)) {
    let methods;
    if (!(methods = helpers[trait])) {
      continue;
    }

    h[trait] = {};
    for (const key in methods) {
      const method = methods[key];
      h[trait][key] = method.bind(object);
    }
  }
  return h;
};

function __guard__(value, transform) {
  return typeof value !== "undefined" && value !== null
    ? transform(value)
    : undefined;
}

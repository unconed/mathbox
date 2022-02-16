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

export class DOM extends Primitive {
  static initClass() {
    this.traits = [
      "node",
      "bind",
      "object",
      "visible",
      "overlay",
      "dom",
      "attach",
      "position",
    ];
  }

  init() {
    this.emitter = this.root = null;
    this.active = {};
  }

  make() {
    super.make();

    // Bind to attached objects
    this._helpers.bind.make([
      { to: "dom.html", trait: "html" },
      { to: "dom.points", trait: "source" },
    ]);

    if (this.bind.points == null || this.bind.html == null) {
      return;
    }

    // Listen for updates
    this.root = this._inherit("root");
    this._listen("root", "root.update", this.update);
    this._listen("root", "root.post", this.post);

    // Fetch geometry dimensions
    const pointDims = this.bind.points.getDimensions();
    const htmlDims = this.bind.html.getDimensions();

    const items = Math.min(pointDims.items, htmlDims.items);
    const width = Math.min(pointDims.width, htmlDims.width);
    const height = Math.min(pointDims.height, htmlDims.height);
    const depth = Math.min(pointDims.depth, htmlDims.depth);

    // Build shader to sample position data
    let position = this.bind.points.sourceShader(this._shaders.shader());

    // Transform data into screen space
    position = this._helpers.position.pipeline(position);

    // Apply global projection
    const projection = this._shaders.shader({ globals: ["projectionMatrix"] });
    projection.pipe("project.readback");
    position.pipe(projection);

    // Build nop index shader
    const indexer = this._shaders.shader();

    // Prepare readback/memo RTT
    this.readback = this._renderables.make("readback", {
      map: position,
      indexer,
      items,
      width,
      height,
      depth,
      channels: 4,
      stpq: true,
    });

    // Prepare overlay container VDOM
    this.dom = this._overlays.make("dom");
    this.dom.hint(items * width * height * depth * 2);
    // Make sure we have enough for wrapping each given element once

    // Prepare readback consumer
    this.emitter = this.callback(this.bind.html.nodes());
    this.readback.setCallback(this.emitter);

    this._helpers.visible.make();
  }

  unmake() {
    if (this.readback != null) {
      this.readback.dispose();
      this.dom.dispose();
      this.readback = this.dom = null;

      this.root = null;
      this.emitter = null;
      this.active = {};
    }

    this._helpers.bind.unmake();
    this._helpers.visible.unmake();
  }

  update() {
    if (this.readback == null) {
      return;
    }
    if (this.props.visible) {
      this.readback.update(
        this.root != null ? this.root.getCamera() : undefined
      );
      this.readback.post();
      this.readback.iterate();
    }
  }

  post() {
    if (this.readback == null) {
      return;
    }
    this.dom.render(this.isVisible ? this.emitter.nodes() : []);
  }

  callback(data) {
    // Create static consumer for the readback
    let strideJ, strideK;
    const uniforms = this._inherit("unit").getUnitUniforms();
    const width = uniforms.viewWidth;
    const height = uniforms.viewHeight;

    const attr = this.node.attributes["dom.attributes"];
    const size = this.node.attributes["dom.size"];
    const zoom = this.node.attributes["dom.zoom"];
    const color = this.node.attributes["dom.color"];
    const outline = this.node.attributes["dom.outline"];
    const pointer = this.node.attributes["dom.pointerEvents"];
    const opacity = this.node.attributes["overlay.opacity"];
    const zIndex = this.node.attributes["overlay.zIndex"];
    const offset = this.node.attributes["attach.offset"];
    const depth = this.node.attributes["attach.depth"];
    const snap = this.node.attributes["attach.snap"];
    const { el } = this.dom;

    let nodes = [];
    let styles = null;
    let className = null;

    let strideI = (strideJ = strideK = 0);
    let colorString = "";

    const f = function (x, y, z, w, i, j, k, l) {
      // Get HTML item by offset
      let v;
      const index = l + strideI * i + strideJ * j + strideK * k;
      const children = data[index];

      // Clip behind camera or when invisible
      const clip = w < 0;

      // Depth blending
      const iw = 1 / w;
      const flatZ = 1 + (iw - 1) * depth.value;
      const scale = clip ? 0 : flatZ;

      // GL to CSS coordinate transform
      const ox = +offset.value.x * scale;
      const oy = +offset.value.y * scale;
      let xx = (x + 1) * width.value * 0.5 + ox;
      let yy = (y - 1) * height.value * 0.5 + oy;

      // Handle zoom/scale
      xx /= zoom.value;
      yy /= zoom.value;

      // Snap to pixel
      if (snap.value) {
        xx = Math.round(xx);
        yy = Math.round(yy);
      }

      // Clip and apply opacity
      const alpha = Math.min(0.999, clip ? 0 : opacity.value);

      // Generate div
      const props = {
        className,
        style: {
          transform: `translate3d(${xx}px, ${-yy}px, ${
            1 - w
          }px) translate(-50%, -50%) scale(${scale},${scale})`,
          opacity: alpha,
        },
      };
      for (k in styles) {
        v = styles[k];
        props.style[k] = v;
      }

      // Merge in external attributes
      const a = attr.value;
      if (a != null) {
        const s = a.style;
        for (k in a) {
          v = a[k];
          if (!["style", "className"].includes(k)) {
            props[k] = v;
          }
        }
        if (s != null) {
          for (k in s) {
            v = s[k];
            props.style[k] = v;
          }
        }
      }
      props.className +=
        " " +
        ((a != null ? a.className : undefined) != null
          ? a != null
            ? a.className
            : undefined
          : "mathbox-label");

      // Push node onto list
      return nodes.push(el("div", props, children));
    };

    f.reset = () => {
      nodes = [];
      [strideI, strideJ, strideK] = Array.from([
        this.strideI,
        this.strideJ,
        this.strideK,
      ]);

      const c = color.value;
      const m = (x) => Math.floor(x * 255);
      colorString = c ? `rgb(${[m(c.x), m(c.y), m(c.z)]})` : "";

      className = `mathbox-outline-${Math.round(outline.value)}`;
      styles = {};
      if (c) {
        styles.color = colorString;
      }
      styles.fontSize = `${size.value}px`;
      if (zoom.value !== 1) {
        styles.zoom = zoom.value;
      }
      if (zIndex.value > 0) {
        styles.zIndex = zIndex.value;
      }
      if (pointer.value) {
        return (styles.pointerEvents = "auto");
      }
    };

    f.nodes = () => nodes;
    return f;
  }

  resize() {
    let sI, sJ;
    if (this.readback == null) {
      return;
    }

    // Fetch geometry/html dimensions
    const pointDims = this.bind.points.getActiveDimensions();
    const htmlDims = this.bind.html.getActiveDimensions();

    const items = Math.min(pointDims.items, htmlDims.items);
    const width = Math.min(pointDims.width, htmlDims.width);
    const height = Math.min(pointDims.height, htmlDims.height);
    const depth = Math.min(pointDims.depth, htmlDims.depth);

    // Limit readback to active area
    this.readback.setActive(items, width, height, depth);

    // Recalculate iteration strides
    this.strideI = sI = htmlDims.items;
    this.strideJ = sJ = sI * htmlDims.width;
    this.strideK = sJ * htmlDims.height;
  }

  change(changed, _touched, _init) {
    if (changed["dom.html"] || changed["dom.points"]) {
      return this.rebuild();
    }
  }
}
DOM.initClass();

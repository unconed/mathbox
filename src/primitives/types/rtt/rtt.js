// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Parent } from "../base/parent";

export class RTT extends Parent {
  static initClass() {
    this.traits = [
      "node",
      "root",
      "scene",
      "vertex",
      "texture",
      "rtt",
      "source",
      "index",
      "image",
    ];
    this.defaults = {
      minFilter: "linear",
      magFilter: "linear",
      type: "unsignedByte",
    };
  }

  init() {
    return (this.rtt =
      this.scene =
      this.camera =
      this.width =
      this.height =
      this.history =
      this.rootSize =
      this.size =
        null);
  }

  indexShader(shader) {
    return shader;
  }
  imageShader(shader) {
    return this.rtt.shaderRelative(shader);
  }
  sourceShader(shader) {
    return this.rtt.shaderAbsolute(shader, this.history);
  }

  getDimensions() {
    return {
      items: 1,
      width: this.width,
      height: this.height,
      depth: this.history,
    };
  }

  getActiveDimensions() {
    return this.getDimensions();
  }

  make() {
    let aspect;
    this.parentRoot = this._inherit("root");
    this.rootSize = this.parentRoot.getSize();

    this._listen(this.parentRoot, "root.pre", this.pre);
    this._listen(this.parentRoot, "root.update", this.update);
    this._listen(this.parentRoot, "root.render", this.render);
    this._listen(this.parentRoot, "root.post", this.post);
    this._listen(this.parentRoot, "root.camera", this.setCamera);
    this._listen(this.parentRoot, "root.resize", function (event) {
      return this.resize(event.size);
    });

    if (this.rootSize == null) {
      return;
    }

    const { minFilter, magFilter, type } = this.props;

    const { width, height, history, size } = this.props;

    const relativeSize =
      size === this.node.attributes["rtt.size"].enum.relative;
    const widthFactor = relativeSize ? this.rootSize.renderWidth : 1;
    const heightFactor = relativeSize ? this.rootSize.renderHeight : 1;

    this.width = Math.round(
      width != null ? width * widthFactor : this.rootSize.renderWidth
    );
    this.height = Math.round(
      height != null ? height * heightFactor : this.rootSize.renderHeight
    );
    this.history = history;
    this.aspect = aspect = this.width / this.height;

    if (this.scene == null) {
      this.scene = this._renderables.make("scene");
    }
    this.rtt = this._renderables.make("renderToTexture", {
      scene: this.scene,
      camera: this._context.defaultCamera,
      width: this.width,
      height: this.height,
      frames: this.history,
      minFilter,
      magFilter,
      type,
    });

    aspect = width || height ? aspect : this.rootSize.aspect;
    const viewWidth = width != null ? width : this.rootSize.viewWidth;
    const viewHeight = height != null ? height : this.rootSize.viewHeight;

    return (this.size = {
      renderWidth: this.width,
      renderHeight: this.height,
      aspect,
      viewWidth,
      viewHeight,
      pixelRatio: this.height / viewHeight,
    });
  }

  made() {
    // Notify of buffer reallocation
    this.trigger({
      type: "source.rebuild",
    });

    if (this.size) {
      return this.trigger({
        type: "root.resize",
        size: this.size,
      });
    }
  }

  unmake(rebuild) {
    if (this.rtt == null) {
      return;
    }

    this.rtt.dispose();
    if (!rebuild) {
      this.scene.dispose();
    }

    return (this.rtt = this.width = this.height = this.history = null);
  }

  change(changed, touched, init) {
    if (touched["texture"] || changed["rtt.width"] || changed["rtt.height"]) {
      return this.rebuild();
    }

    if (changed["root.camera"] || init) {
      this._unattach();
      this._attach(
        this.props.camera,
        "camera",
        this.setCamera,
        this,
        this,
        true
      );
      return this.setCamera();
    }
  }

  adopt(renderable) {
    return Array.from(renderable.renders).map((object) =>
      this.scene.add(object)
    );
  }
  unadopt(renderable) {
    return Array.from(renderable.renders).map((object) =>
      this.scene.remove(object)
    );
  }

  resize(size) {
    let height, width;
    this.rootSize = size;

    ({ width, height, size } = this.props);
    const relativeSize =
      size === this.node.attributes["rtt.size"].enum.relative;

    if (!this.rtt || width == null || height == null || relativeSize) {
      return this.rebuild();
    }
  }

  select(selector) {
    return this._root.node.model.select(selector, [this.node]);
  }

  watch(selector, handler) {
    return this._root.node.model.watch(selector, handler);
  }

  unwatch(handler) {
    return this._root.node.model.unwatch(handler);
  }

  pre(e) {
    return this.trigger(e);
  }
  update(e) {
    let camera;
    if ((camera = this.getOwnCamera()) != null) {
      camera.aspect = this.aspect || 1;
      camera.updateProjectionMatrix();
    }
    return this.trigger(e);
  }
  render(e) {
    this.trigger(e);
    return this.rtt != null ? this.rtt.render(this.getCamera()) : undefined;
  }
  post(e) {
    return this.trigger(e);
  }

  setCamera() {
    const camera = __guard__(
      this.select(this.props.camera)[0],
      (x) => x.controller
    );
    if (this.camera !== camera) {
      this.camera = camera;
      this.rtt.camera = this.getCamera();
      return this.trigger({ type: "root.camera" });
    } else if (!this.camera) {
      return this.trigger({ type: "root.camera" });
    }
  }

  getOwnCamera() {
    return this.camera != null ? this.camera.getCamera() : undefined;
  }
  getCamera() {
    let left;
    return (left = this.getOwnCamera()) != null
      ? left
      : this._inherit("root").getCamera();
  }

  // End transform chain here
  vertex(shader, pass) {
    if (pass === 2) {
      return shader.pipe("view.position");
    }
    if (pass === 3) {
      return shader.pipe("root.position");
    }
    return shader;
  }
}
RTT.initClass();

function __guard__(value, transform) {
  return typeof value !== "undefined" && value !== null
    ? transform(value)
    : undefined;
}

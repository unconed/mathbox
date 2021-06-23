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
import { Parent } from "./parent";

export class Root extends Parent {
  static initClass() {
    this.traits = ["node", "root", "clock", "scene", "vertex", "unit"];
  }

  init() {
    this.size = null;

    this.cameraEvent = { type: "root.camera" };
    this.preEvent = { type: "root.pre" };
    this.updateEvent = { type: "root.update" };
    this.renderEvent = { type: "root.render" };
    this.postEvent = { type: "root.post" };

    this.clockEvent = { type: "clock.tick" };

    return (this.camera = null);
  }

  make() {
    return this._helpers.unit.make();
  }
  unmake() {
    return this._helpers.unit.unmake();
  }

  change(changed, touched, init) {
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
      this._context.scene.add(object)
    );
  }
  unadopt(renderable) {
    return Array.from(renderable.renders).map((object) =>
      this._context.scene.remove(object)
    );
  }

  select(selector) {
    return this.node.model.select(selector);
  }

  watch(selector, handler) {
    return this.node.model.watch(selector, handler);
  }

  unwatch(handler) {
    return this.node.model.unwatch(handler);
  }

  resize(size) {
    this.size = size;
    return this.trigger({
      type: "root.resize",
      size,
    });
  }

  getSize() {
    return this.size;
  }
  getSpeed() {
    return this.props.speed;
  }

  getUnit() {
    return this._helpers.unit.get();
  }
  getUnitUniforms() {
    return this._helpers.unit.uniforms();
  }

  pre() {
    this.getCamera().updateProjectionMatrix();
    this.trigger(this.clockEvent);
    return this.trigger(this.preEvent);
  }

  update() {
    return this.trigger(this.updateEvent);
  }
  render() {
    return this.trigger(this.renderEvent);
  }
  post() {
    return this.trigger(this.postEvent);
  }

  setCamera() {
    const camera = __guard__(
      this.select(this.props.camera)[0],
      (x) => x.controller
    );
    if (this.camera !== camera) {
      this.camera = camera;
      return this.trigger({ type: "root.camera" });
    }
  }

  getCamera() {
    let left;
    return (left = this.camera != null ? this.camera.getCamera() : undefined) !=
      null
      ? left
      : this._context.defaultCamera;
  }

  getTime() {
    return this._context.time;
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
Root.initClass();

function __guard__(value, transform) {
  return typeof value !== "undefined" && value !== null
    ? transform(value)
    : undefined;
}

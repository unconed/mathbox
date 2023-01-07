// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import { Object3D, PerspectiveCamera, Scene as ThreeScene, WebGLRenderTarget  } from "three";
import { Renderable } from "./renderable.js";

/*
 All MathBox renderables sit inside this root, to keep things tidy.
*/
class MathBox extends Object3D {
  constructor() {
    super();
    this.rotationAutoUpdate = false;
    this.frustumCulled = false;
    this.matrixAutoUpdate = false;
  }
}

/*
 Holds the root and binds to a THREE.Scene

 Will hold objects and inject them a few at a time
 to avoid long UI blocks.

 Will render injected objects to a 1x1 scratch buffer to ensure availability
*/
export class Scene extends Renderable {
  constructor(renderer, shaders, options) {
    super(renderer, shaders, options);
    this.root = new MathBox();

    if ((options != null ? options.scene : undefined) != null) {
      this.scene = options.scene;
    }
    if (this.scene == null) {
      this.scene = new ThreeScene();
    }

    this.pending = [];
    this.async = 0;

    this.scratch = new WebGLRenderTarget(1, 1);
    this.camera = new PerspectiveCamera();
  }

  inject(scene) {
    if (scene != null) {
      this.scene = scene;
    }
    return this.scene.add(this.root);
  }

  unject() {
    return this.scene != null ? this.scene.remove(this.root) : undefined;
  }

  add(object) {
    if (this.async) {
      return this.pending.push(object);
    } else {
      return this._add(object);
    }
  }

  remove(object) {
    this.pending = this.pending.filter((o) => o !== object);
    if (object.parent != null) {
      return this._remove(object);
    }
  }

  _add(object) {
    return this.root.add(object);
  }

  _remove(object) {
    return this.root.remove(object);
  }

  dispose() {
    if (this.root.parent != null) {
      return this.unject();
    }
  }

  warmup(n) {
    return (this.async = +n || 0);
  }

  render() {
    if (!this.pending.length) {
      return;
    }
    const { children } = this.root;

    // Insert up to @async children
    const added = [];
    for (
      let i = 0, end = this.async, asc = 0 <= end;
      asc ? i < end : i > end;
      asc ? i++ : i--
    ) {
      const pending = this.pending.shift();
      if (!pending) {
        break;
      }

      // Insert new child
      this._add(pending);
      added.push(added);
    }

    // Remember current visibility
    const visible = children.map(function (o) {
      return o.visible;
    });

    // Force only this child visible
    children.map((o) => (o.visible = !Array.from(added).includes(o)));

    // Render and throw away
    const currentTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.scratch);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(currentTarget);

    // Restore visibility
    return children.map((o, i) => (o.visible = visible[i]));
  }

  toJSON() {
    return this.root.toJSON();
  }
}

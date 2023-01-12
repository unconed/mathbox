// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as Model from "./model";
import * as Overlay from "./overlay";
import * as Primitives from "./primitives";
import * as Render from "./render";
import * as Shaders from "./shaders";
import * as Stage from "./stage";
import * as Util from "./util";

import { PerspectiveCamera } from "three";

export class Context {
  static initClass() {
    // Export for extending. TODO what is the story here, what is this syntax?
    this.Namespace = {
      Model,
      Overlay,
      Primitives,
      Render,
      Shaders,
      Stage,
      Util,
      DOM: Util.VDOM,
    };
    this.Version = "2.3.0";
  }

  //-------------------------------------------------------------------

  // Set up entire environment
  constructor(renderer, scene = null, camera = null) {
    // DOM container
    let canvas;
    this.canvas = canvas = renderer.domElement;
    this.element = null;

    // Rendering factory
    this.shaders = Shaders.Factory(Shaders.Snippets);

    this.renderables = new Render.Factory(
      Render.Classes,
      renderer,
      this.shaders
    );
    this.overlays = new Overlay.Factory(Overlay.Classes, canvas);

    this.scene = this.renderables.make("scene", { scene });
    this.camera = this.defaultCamera =
      camera != null ? camera : new PerspectiveCamera();

    // Primitives factory
    this.attributes = new Model.Attributes(Primitives.Types, this);
    this.primitives = new Primitives.Factory(Primitives.Types, this);

    this.root = this.primitives.make("root");

    // Document model
    this.model = new Model.Model(this.root);
    this.guard = new Model.Guard();

    // Scene controllers
    this.controller = new Stage.Controller(this.model, this.primitives);
    this.animator = new Stage.Animator(this);

    // Public API
    this.api = new Stage.API(this);

    // Global clocks, one real-time and one adjustable
    this.speed = 1;
    this.time = {
      now: +new Date() / 1000,
      time: 0,
      delta: 0,
      clock: 0,
      step: 0,
    };
  }

  //-------------------------------------------------------------------
  // Lifecycle

  init() {
    this.scene.inject();
    this.overlays.inject();
    return this;
  }

  destroy() {
    this.scene.unject();
    this.overlays.unject();
    return this;
  }

  resize(size) {
    /*
    {
      viewWidth, viewHeight, renderWidth, renderHeight, aspect, pixelRatio
    }
    */
    if (size == null) {
      size = {};
    }
    if (size.renderWidth == null) {
      size.renderWidth =
        size.viewWidth != null ? size.viewWidth : (size.viewWidth = 1280);
    }
    if (size.renderHeight == null) {
      size.renderHeight =
        size.viewHeight != null ? size.viewHeight : (size.viewHeight = 720);
    }
    if (size.pixelRatio == null) {
      size.pixelRatio = size.renderWidth / Math.max(0.000001, size.viewWidth);
    }
    if (size.aspect == null) {
      size.aspect = size.viewWidth / Math.max(0.000001, size.viewHeight);
    }

    this.root.controller.resize(size);
    return this;
  }

  frame(time) {
    /*
    {
      now, clock, step
    }
    */
    this.pre(time);
    this.update();
    this.render();
    this.post();
    return this;
  }

  //-------------------------------------------------------------------
  // Broken down update/render cycle, for manual scheduling/invocation

  pre(time) {
    if (!time) {
      time = {
        now: +new Date() / 1000,
        time: 0,
        delta: 0,
        clock: 0,
        step: 0,
      };

      time.delta = this.time.now != null ? time.now - this.time.now : 0;

      // Check for stopped render loop, assume 1 60fps frame
      if (time.delta > 1) {
        time.delta = 1 / 60;
      }

      time.step = time.delta * this.speed;
      time.time = this.time.time + time.delta;
      time.clock = this.time.clock + time.step;
    }

    this.time = time;
    if (typeof this.root.controller.pre === "function") {
      this.root.controller.pre();
    }
    return this;
  }

  update() {
    this.animator.update();
    this.attributes.compute();

    this.guard.iterate({
      step: () => {
        let change = this.attributes.digest();
        return change || (change = this.model.digest());
      },
      last() {
        return {
          attribute: this.attributes.getLastTrigger(),
          model: this.model.getLastTrigger(),
        };
      },
    });

    if (typeof this.root.controller.update === "function") {
      this.root.controller.update();
    }

    this.camera = this.root.controller.getCamera();
    this.speed = this.root.controller.getSpeed();

    return this;
  }

  render() {
    if (typeof this.root.controller.render === "function") {
      this.root.controller.render();
    }
    this.scene.render();

    return this;
  }

  post() {
    if (typeof this.root.controller.post === "function") {
      this.root.controller.post();
    }
    return this;
  }

  //-------------------------------------------------------------------
  // Warmup mode, inserts only n objects into the scene per frame
  // Will render objects to offscreen 1x1 buffer to ensure shader is compiled even if invisible
  setWarmup(n) {
    this.scene.warmup(n);
    return this;
  }

  getPending() {
    return this.scene.pending.length;
  }
}
Context.initClass();

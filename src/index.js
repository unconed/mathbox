// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import "./splash";
import "@mentat/threestrap";
import * as THREE from "three";
import * as model from "./model";
import * as overlay from "./overlay";
import * as primitives from "./primitives";
import * as render from "./render";
import * as shaders from "./shaders";
import * as stage from "./stage";
import * as util from "./util";
import { Context as ctx } from "./context";

export const version = "0.0.5";

// Just because
export const π = Math.PI;
export const τ = π * 2;
export const e = Math.E;
export const Context = ctx;
export const Model = model;
export const Overlay = overlay;
export const Primitives = primitives;
export const Render = render;
export const Shaders = shaders;
export const Stage = stage;
export const Util = util;
export const DOM = util.VDOM;

export const mathBox = function (options) {
  const three = THREE.Bootstrap(options);

  if (!three.fallback) {
    if (!three.Time) {
      three.install("time");
    }
    if (!three.MathBox) {
      three.install(["mathbox", "splash"]);
    }
  }

  return three.mathbox != null ? three.mathbox : three;
};

// Load context and export namespace
// TODO suspicious... how can I export??
// for (let k in Context.Namespace) {
//   const v = Context.Namespace[k];
//   exports[k] = v;
// }

// Threestrap plugin
THREE.Bootstrap.registerPlugin("mathbox", {
  defaults: {
    init: true,
    warmup: 2,
    inspect: true,
    splash: true,
  },

  listen: ["ready", "pre", "update", "post", "resize"],

  // Install meta-API
  install(three) {
    let inited = false;
    this.first = true;

    return (three.MathBox = {
      // Init the mathbox context
      init: (options) => {
        if (inited) {
          return;
        }
        inited = true;

        const scene =
          (options != null ? options.scene : undefined) ||
          this.options.scene ||
          three.scene;
        const camera =
          (options != null ? options.camera : undefined) ||
          this.options.camera ||
          three.camera;

        this.context = new Context(three.renderer, scene, camera);

        // Enable handy destructuring
        this.context.api.three = three.three = three;
        this.context.api.mathbox = three.mathbox = this.context.api;

        // v1 compatibility
        this.context.api.start = () => three.Loop.start();
        this.context.api.stop = () => three.Loop.stop();

        // Initialize and set initial size
        this.context.init();
        this.context.resize(three.Size);

        // Set warmup mode and track pending objects
        this.context.setWarmup(this.options.warmup);
        this.pending = 0;
        this.warm = !this.options.warmup;

        console.log("MathBox²", version);
        return three.trigger({
          type: "mathbox/init",
          version: version,
          context: this.context,
        });
      },

      // Destroy the mathbox context
      destroy: () => {
        if (!inited) {
          return;
        }
        inited = false;

        three.trigger({ type: "mathbox/destroy", context: this.context });

        this.context.destroy();

        delete three.mathbox;
        delete this.context.api.three;
        delete this.context;
      },

      object: () =>
        this.context != null ? this.context.scene.root : undefined,
    });
  },

  uninstall(three) {
    three.MathBox.destroy();
    delete three.MathBox;
  },

  // Ready event: right before mathbox() / THREE.bootstrap() returns
  ready(event, three) {
    if (this.options.init) {
      three.MathBox.init();

      return setTimeout(() => {
        if (this.options.inspect) {
          return this.inspect(three);
        }
      });
    }
  },

  // Log scene for inspection
  inspect(three) {
    this.context.api.inspect();
    if (!this.options.warmup) {
      return this.info(three);
    }
  },

  info(three) {
    const fmt = function (x) {
      const out = [];
      while (x >= 1000) {
        out.unshift(("000" + (x % 1000)).slice(-3));
        x = Math.floor(x / 1000);
      }
      out.unshift(x);
      return out.join(",");
    };

    const info = three.renderer.info.render;
    console.log(
      "Geometry  ",
      fmt(info.faces) + " faces  ",
      fmt(info.vertices) + " vertices  ",
      fmt(info.calls) + " draw calls  "
    );
  },

  // Hook up context events
  resize(event, three) {
    return this.context != null ? this.context.resize(three.Size) : undefined;
  },

  pre(event, three) {
    return this.context != null ? this.context.pre(three.Time) : undefined;
  },

  update(event, three) {
    let camera;
    if (this.context != null) {
      this.context.update();
    }

    if (
      (camera = this.context != null ? this.context.camera : undefined) &&
      camera !== three.camera
    ) {
      three.camera = camera;
    }

    three.Time.set({ speed: this.context.speed });

    this.progress(this.context.getPending(), three);

    // Call render here instead of on:render because it renders off screen material
    // that needs to be available for rendering the actual frame.
    return this.context != null ? this.context.render() : undefined;
  },

  post(_event, _three) {
    return this.context != null ? this.context.post() : undefined;
  },

  // Warmup progress changed
  progress(remain, three) {
    if (!remain && !this.pending) {
      return;
    }

    // Latch max value until queue is emptied to get a total
    let pending = Math.max(remain + this.options.warmup, this.pending);

    // Send events for external progress reporting
    const current = pending - remain;
    const total = pending;
    three.trigger({
      type: "mathbox/progress",
      current: pending - remain,
      total: pending,
    });

    if (remain === 0) {
      pending = 0;
    }
    this.pending = pending;

    // Report once when loaded
    if (current === total && !this.warm) {
      this.warm = true;
      if (this.options.inspect) {
        this.info(three);
      }
    }
  },
});

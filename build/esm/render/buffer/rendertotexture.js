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
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera.js";
import { RenderTarget } from "./texture/rendertarget.js";
import { Renderable } from "../renderable.js";
import { Scene } from "three/src/scenes/Scene.js";
import { Vector2 } from "three/src/math/Vector2.js";
import { Vector3 } from "three/src/math/Vector3.js";
/*
 * Render-To-Texture with history
 */
export class RenderToTexture extends Renderable {
    constructor(renderer, shaders, options) {
        super(renderer, shaders);
        this.scene = options.scene != null ? options.scene : new Scene();
        this.camera = options.camera;
        this.build(options);
    }
    shaderRelative(shader) {
        if (shader == null) {
            shader = this.shaders.shader();
        }
        return shader.pipe("sample.2d", this.uniforms);
    }
    shaderAbsolute(shader, frames, indices) {
        if (frames == null) {
            frames = 1;
        }
        if (indices == null) {
            indices = 4;
        }
        if (shader == null) {
            shader = this.shaders.shader();
        }
        if (frames <= 1) {
            if (indices > 2) {
                shader.pipe(UGLSL.truncateVec(indices, 2));
            }
            shader.pipe("map.2d.data", this.uniforms);
            return shader.pipe("sample.2d", this.uniforms);
        }
        else {
            const sample2DArray = UGLSL.sample2DArray(Math.min(frames, this.target.frames));
            if (indices < 4) {
                shader.pipe(UGLSL.extendVec(indices, 4));
            }
            shader.pipe("map.xyzw.2dv");
            shader.split();
            shader.pipe("map.2d.data", this.uniforms);
            shader.pass();
            return shader.pipe(sample2DArray, this.uniforms);
        }
    }
    build(options) {
        if (!this.camera) {
            this.camera = new PerspectiveCamera();
            this.camera.position.set(0, 0, 3);
            this.camera.lookAt(new Vector3());
        }
        if (typeof this.scene.inject === "function") {
            this.scene.inject();
        }
        this.target = new RenderTarget(this.gl, options.width, options.height, options.frames, options);
        this.target.warmup((target) => this.renderer.setRenderTarget(target));
        this.renderer.setRenderTarget(null);
        this._adopt(this.target.uniforms);
        this._adopt({
            dataPointer: {
                type: "v2",
                value: new Vector2(0.5, 0.5),
            },
        });
        return (this.filled = 0);
    }
    adopt(renderable) {
        return Array.from(renderable.renders).map((object) => this.scene.add(object));
    }
    unadopt(renderable) {
        return Array.from(renderable.renders).map((object) => this.scene.remove(object));
    }
    render(camera) {
        if (camera == null) {
            ({ camera } = this);
        }
        const currentTarget = this.renderer.getRenderTarget();
        this.renderer.setRenderTarget(this.target.write);
        this.renderer.render(this.scene.scene != null ? this.scene.scene : this.scene, camera);
        this.renderer.setRenderTarget(currentTarget);
        this.target.cycle();
        if (this.filled < this.target.frames) {
            return this.filled++;
        }
    }
    read(frame) {
        if (frame == null) {
            frame = 0;
        }
        return this.target.reads[Math.abs(frame)];
    }
    getFrames() {
        return this.target.frames;
    }
    getFilled() {
        return this.filled;
    }
    dispose() {
        if (typeof this.scene.unject === "function") {
            this.scene.unject();
        }
        this.scene = this.camera = null;
        this.target.dispose();
        return super.dispose();
    }
}

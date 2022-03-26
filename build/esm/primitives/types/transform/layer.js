// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Transform } from "./transform.js";
export class Layer extends Transform {
    static initClass() {
        this.traits = ["node", "vertex", "layer"];
    }
    make() {
        this._listen("root", "root.resize", this.update);
        return (this.uniforms = {
            layerScale: this._attributes.make(this._types.vec4()),
            layerBias: this._attributes.make(this._types.vec4()),
        });
    }
    update() {
        const camera = this._inherit("root").getCamera();
        const aspect = camera.aspect != null ? camera.aspect : 1;
        const fov = camera.fov != null ? camera.fov : 1;
        const pitch = Math.tan((fov * Math.PI) / 360);
        const _enum = this.node.attributes["layer.fit"].enum;
        let { fit } = this.props;
        const { depth } = this.props;
        // Convert contain/cover into x/y
        switch (fit) {
            case _enum.contain:
                fit = aspect > 1 ? _enum.y : _enum.x;
                break;
            case _enum.cover:
                fit = aspect > 1 ? _enum.x : _enum.y;
                break;
        }
        // Fit x/y
        switch (fit) {
            case _enum.x:
                this.uniforms.layerScale.value.set(pitch * aspect, pitch * aspect);
                break;
            case _enum.y:
                this.uniforms.layerScale.value.set(pitch, pitch);
                break;
        }
        return this.uniforms.layerBias.value.set(0, 0, -depth, 0);
    }
    change(changed, touched, init) {
        if (changed["layer.fit"] || changed["layer.depth"] || init) {
            return this.update();
        }
    }
    // End transform chain here without applying camera view
    vertex(shader, pass) {
        if (pass === 2) {
            return shader.pipe("layer.position", this.uniforms);
        }
        if (pass === 3) {
            return shader.pipe("root.position");
        }
        return shader;
    }
}
Layer.initClass();

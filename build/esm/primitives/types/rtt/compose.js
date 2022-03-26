// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Primitive } from "../../primitive.js";
export class Compose extends Primitive {
    static initClass() {
        this.traits = [
            "node",
            "bind",
            "object",
            "visible",
            "operator",
            "style",
            "compose",
        ];
        this.defaults = {
            zWrite: false,
            zTest: false,
            color: "#ffffff",
        };
    }
    init() {
        return (this.compose = null);
    }
    //rebuild: () ->
    //  console.log 'compose.rebuild', @node.get(null, true), @bind.source?
    //  super()
    resize() {
        if (!this.compose || !this.bind.source) {
            return;
        }
        const dims = this.bind.source.getActiveDimensions();
        const { width } = dims;
        const { height } = dims;
        return this.remapUVScale.set(width, height);
    }
    make() {
        // Bind to attached data sources
        this._helpers.bind.make([{ to: "operator.source", trait: "source" }]);
        if (this.bind.source == null) {
            return;
        }
        // Prepare uniforms for remapping to absolute coords on the fly
        const resampleUniforms = {
            remapUVScale: this._attributes.make(this._types.vec2()),
        };
        this.remapUVScale = resampleUniforms.remapUVScale.value;
        // Build fragment shader
        let fragment = this._shaders.shader();
        const { alpha } = this.props;
        if (this.bind.source.is("image")) {
            // Sample image directly in 2D UV
            fragment.pipe("screen.pass.uv", resampleUniforms);
            fragment = this.bind.source.imageShader(fragment);
        }
        else {
            // Sample data source in 4D
            fragment.pipe("screen.map.xy", resampleUniforms);
            fragment = this.bind.source.sourceShader(fragment);
        }
        // Force pixels to solid if requested
        if (!alpha) {
            fragment.pipe("color.opaque");
        }
        // Make screen renderable
        const composeUniforms = this._helpers.style.uniforms();
        this.compose = this._renderables.make("screen", {
            map: fragment,
            uniforms: composeUniforms,
            linear: true,
        });
        this._helpers.visible.make();
        return this._helpers.object.make([this.compose]);
    }
    made() {
        return this.resize();
    }
    unmake() {
        this._helpers.bind.unmake();
        this._helpers.visible.unmake();
        return this._helpers.object.unmake();
    }
    change(changed, _touched, _init) {
        if (changed["operator.source"] || changed["compose.alpha"]) {
            return this.rebuild();
        }
    }
}
Compose.initClass();

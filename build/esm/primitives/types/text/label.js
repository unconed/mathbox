// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as UJS from "../../../util/js.js";
import { Primitive } from "../../primitive.js";
export class Label extends Primitive {
    static initClass() {
        this.traits = [
            "node",
            "bind",
            "object",
            "visible",
            "style",
            "label",
            "attach",
            "geometry",
            "position",
        ];
    }
    make() {
        let color;
        super.make();
        // Bind to attached objects
        this._helpers.bind.make([
            { to: "label.text", trait: "text" },
            { to: "geometry.points", trait: "source" },
            { to: "geometry.colors", trait: "source" },
        ]);
        if (this.bind.points == null) {
            return;
        }
        if (this.bind.text == null) {
            return;
        }
        // Fetch geometry/text dimensions
        const pointDims = this.bind.points.getDimensions();
        const textDims = this.bind.text.getDimensions();
        const textIsSDF = this.bind.text.textIsSDF();
        const items = Math.min(pointDims.items, textDims.items);
        const width = Math.min(pointDims.width, textDims.width);
        const height = Math.min(pointDims.height, textDims.height);
        const depth = Math.min(pointDims.depth, textDims.depth);
        // Build shader to sample position data
        // and transform into screen space
        let position = this.bind.points.sourceShader(this._shaders.shader());
        position = this._helpers.position.pipeline(position);
        // Build shader to sample text geometry data
        const sprite = this.bind.text.sourceShader(this._shaders.shader());
        // Build shader to sample text image data
        const map = this._shaders.shader().pipe("label.map");
        map.pipe(this.bind.text.textShader(this._shaders.shader()));
        // Build shader to resolve text data
        const labelUniforms = {
            spriteDepth: this.node.attributes["attach.depth"],
            spriteOffset: this.node.attributes["attach.offset"],
            spriteSnap: this.node.attributes["attach.snap"],
            spriteScale: this._attributes.make(this._types.number()),
            outlineStep: this._attributes.make(this._types.number()),
            outlineExpand: this._attributes.make(this._types.number()),
            outlineColor: this.node.attributes["label.background"],
        };
        this.spriteScale = labelUniforms.spriteScale;
        this.outlineStep = labelUniforms.outlineStep;
        this.outlineExpand = labelUniforms.outlineExpand;
        const snippet = textIsSDF ? "label.outline" : "label.alpha";
        const combine = this._shaders.shader().pipe(snippet, labelUniforms);
        // Build color lookup
        if (this.bind.colors) {
            color = this._shaders.shader();
            this.bind.colors.sourceShader(color);
        }
        // Build transition mask lookup
        const mask = this._helpers.object.mask();
        // Prepare bound uniforms
        const styleUniforms = this._helpers.style.uniforms();
        const unitUniforms = this._inherit("unit").getUnitUniforms();
        // Make sprite renderable
        const uniforms = UJS.merge(unitUniforms, styleUniforms, labelUniforms);
        this.sprite = this._renderables.make("sprite", {
            uniforms,
            width,
            height,
            depth,
            items,
            position,
            sprite,
            map,
            combine,
            color,
            mask,
            linear: true,
        });
        this._helpers.visible.make();
        return this._helpers.object.make([this.sprite]);
    }
    unmake() {
        this._helpers.bind.unmake();
        this._helpers.visible.unmake();
        this._helpers.object.unmake();
        return (this.sprite = null);
    }
    resize() {
        // Fetch geometry/text dimensions
        const pointDims = this.bind.points.getActiveDimensions();
        const textDims = this.bind.text.getActiveDimensions();
        const items = Math.min(pointDims.items, textDims.items);
        const width = Math.min(pointDims.width, textDims.width);
        const height = Math.min(pointDims.height, textDims.height);
        const depth = Math.min(pointDims.depth, textDims.depth);
        return this.sprite.geometry.clip(width, height, depth, items);
    }
    change(changed, touched, _init) {
        if (touched["geometry"] || changed["label.text"]) {
            return this.rebuild();
        }
        if (this.bind.points == null) {
            return;
        }
        const { size } = this.props;
        const { outline } = this.props;
        const { expand } = this.props;
        const height = this.bind.text.textHeight();
        const scale = size / height;
        this.outlineExpand.value = ((expand / scale) * 16) / 255;
        this.outlineStep.value = ((outline / scale) * 16) / 255;
        return (this.spriteScale.value = scale);
    }
}
Label.initClass();

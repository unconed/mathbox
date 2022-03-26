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
export class Point extends Primitive {
    static initClass() {
        this.traits = [
            "node",
            "object",
            "visible",
            "style",
            "point",
            "geometry",
            "position",
            "bind",
            "shade",
        ];
    }
    constructor(node, context, helpers) {
        super(node, context, helpers);
        this.point = null;
    }
    resize() {
        if (this.bind.points == null) {
            return;
        }
        const dims = this.bind.points.getActiveDimensions();
        const { items, width, height, depth } = dims;
        return this.point.geometry.clip(width, height, depth, items);
    }
    make() {
        // Bind to attached data sources
        let color, size;
        this._helpers.bind.make([
            { to: "geometry.points", trait: "source" },
            { to: "geometry.colors", trait: "source" },
            { to: "point.sizes", trait: "source" },
        ]);
        if (this.bind.points == null) {
            return;
        }
        // Build transform chain
        let position = this._shaders.shader();
        // Fetch position and transform to view
        position = this.bind.points.sourceShader(position);
        position = this._helpers.position.pipeline(position);
        // Fetch geometry dimensions
        const dims = this.bind.points.getDimensions();
        const { items, width, height, depth } = dims;
        // Prepare bound uniforms
        const styleUniforms = this._helpers.style.uniforms();
        const pointUniforms = this._helpers.point.uniforms();
        const unitUniforms = this._inherit("unit").getUnitUniforms();
        // Build color lookup
        if (this.bind.colors) {
            color = this._shaders.shader();
            this.bind.colors.sourceShader(color);
        }
        // Build size lookup
        if (this.bind.sizes) {
            size = this._shaders.shader();
            this.bind.sizes.sourceShader(size);
        }
        // Build transition mask lookup
        const mask = this._helpers.object.mask();
        // Build fragment material lookup
        const material = this._helpers.shade.pipeline() || false;
        // Point style
        const { shape } = this.props;
        const { fill } = this.props;
        const { optical } = this.props;
        // Make point renderable
        const uniforms = UJS.merge(unitUniforms, pointUniforms, styleUniforms);
        this.point = this._renderables.make("point", {
            uniforms,
            width,
            height,
            depth,
            items,
            position,
            color,
            size,
            shape,
            optical,
            fill,
            mask,
            material,
        });
        this._helpers.visible.make();
        this._helpers.object.make([this.point]);
    }
    made() {
        return this.resize();
    }
    unmake() {
        this._helpers.bind.unmake();
        this._helpers.visible.unmake();
        this._helpers.object.unmake();
        this.point = null;
    }
    change(changed, _touched, _init) {
        if (changed["geometry.points"] ||
            changed["point.shape"] ||
            changed["point.fill"]) {
            return this.rebuild();
        }
    }
}
Point.initClass();

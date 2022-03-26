// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as UAxis from "../../../util/axis.js";
import * as UJS from "../../../util/js.js";
import { Primitive } from "../../primitive.js";
export class Axis extends Primitive {
    static initClass() {
        this.traits = [
            "node",
            "object",
            "visible",
            "style",
            "line",
            "axis",
            "span",
            "interval",
            "arrow",
            "position",
            "origin",
            "shade",
        ];
        this.defaults = {
            end: true,
            zBias: -1,
        };
    }
    constructor(node, context, helpers) {
        super(node, context, helpers);
        this.axisPosition =
            this.axisStep =
                this.resolution =
                    this.line =
                        this.arrows =
                            null;
    }
    make() {
        // Prepare position shader
        const positionUniforms = {
            axisPosition: this._attributes.make(this._types.vec4()),
            axisStep: this._attributes.make(this._types.vec4()),
        };
        this.axisPosition = positionUniforms.axisPosition.value;
        this.axisStep = positionUniforms.axisStep.value;
        // Build transform chain
        let position = this._shaders.shader();
        position.pipe("axis.position", positionUniforms);
        position = this._helpers.position.pipeline(position);
        // Prepare bound uniforms
        const styleUniforms = this._helpers.style.uniforms();
        const lineUniforms = this._helpers.line.uniforms();
        const arrowUniforms = this._helpers.arrow.uniforms();
        const unitUniforms = this._inherit("unit").getUnitUniforms();
        // Line geometry
        const { detail } = this.props;
        const samples = detail + 1;
        this.resolution = 1 / detail;
        // Clip start/end for terminating arrow
        const { start, end } = this.props;
        // Stroke style
        const { stroke, join } = this.props;
        // Build transition mask lookup
        let mask = this._helpers.object.mask();
        // Build fragment material lookup
        const material = this._helpers.shade.pipeline() || false;
        // Indexing by fixed or by given axis
        const { crossed, axis } = this.props;
        if (!crossed && mask != null && axis > 1) {
            const swizzle = ["x000", "y000", "z000", "w000"][axis];
            mask = this._helpers.position.swizzle(mask, swizzle);
        }
        // Make line renderable
        const uniforms = UJS.merge(arrowUniforms, lineUniforms, styleUniforms, unitUniforms);
        this.line = this._renderables.make("line", {
            uniforms,
            samples,
            position,
            clip: start || end,
            stroke,
            join,
            mask,
            material,
        });
        // Make arrow renderables
        this.arrows = [];
        if (start) {
            this.arrows.push(this._renderables.make("arrow", {
                uniforms,
                flip: true,
                samples,
                position,
                mask,
                material,
            }));
        }
        if (end) {
            this.arrows.push(this._renderables.make("arrow", {
                uniforms,
                samples,
                position,
                mask,
                material,
            }));
        }
        // Visible, object and span traits
        this._helpers.visible.make();
        this._helpers.object.make(this.arrows.concat([this.line]));
        this._helpers.span.make();
        // Monitor view range
        return this._listen(this, "span.range", this.updateRanges);
    }
    unmake() {
        this._helpers.visible.unmake();
        this._helpers.object.unmake();
        return this._helpers.span.unmake();
    }
    change(changed, touched, init) {
        if (changed["axis.detail"] ||
            changed["line.stroke"] ||
            changed["line.join"] ||
            changed["axis.crossed"] ||
            (changed["interval.axis"] && this.props.crossed)) {
            return this.rebuild();
        }
        if (touched["interval"] || touched["span"] || touched["view"] || init) {
            return this.updateRanges();
        }
    }
    updateRanges() {
        const { axis, origin } = this.props;
        const range = this._helpers.span.get("", axis);
        const min = range.x;
        const max = range.y;
        UAxis.setDimension(this.axisPosition, axis).multiplyScalar(min);
        UAxis.setDimension(this.axisStep, axis).multiplyScalar((max - min) * this.resolution);
        return UAxis.addOrigin(this.axisPosition, axis, origin);
    }
}
Axis.initClass();

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
import { Color } from "three/src/math/Color.js";
import { Primitive } from "../../primitive.js";
export class Surface extends Primitive {
    static initClass() {
        this.traits = [
            "node",
            "object",
            "visible",
            "style",
            "line",
            "mesh",
            "geometry",
            "surface",
            "position",
            "grid",
            "bind",
            "shade",
        ];
        this.defaults = {
            lineX: false,
            lineY: false,
        };
    }
    constructor(node, context, helpers) {
        super(node, context, helpers);
        this.lineX = this.lineY = this.surface = null;
    }
    resize() {
        if (this.bind.points == null) {
            return;
        }
        const dims = this.bind.points.getActiveDimensions();
        const { width, height, depth, items } = dims;
        if (this.surface) {
            this.surface.geometry.clip(width, height, depth, items);
        }
        if (this.lineX) {
            this.lineX.geometry.clip(width, height, depth, items);
        }
        if (this.lineY) {
            this.lineY.geometry.clip(height, width, depth, items);
        }
        if (this.bind.map != null) {
            const map = this.bind.map.getActiveDimensions();
            if (this.surface) {
                return this.surface.geometry.map(map.width, map.height, map.depth, map.items);
            }
        }
    }
    make() {
        // Bind to attached data sources
        let color;
        this._helpers.bind.make([
            { to: "geometry.points", trait: "source" },
            { to: "geometry.colors", trait: "source" },
            { to: "mesh.map", trait: "source" },
        ]);
        if (this.bind.points == null) {
            return;
        }
        // Build transform chain
        let position = this._shaders.shader();
        // Fetch position and transform to view
        position = this.bind.points.sourceShader(position);
        position = this._helpers.position.pipeline(position);
        // Prepare bound uniforms
        const styleUniforms = this._helpers.style.uniforms();
        const wireUniforms = this._helpers.style.uniforms();
        const lineUniforms = this._helpers.line.uniforms();
        const surfaceUniforms = this._helpers.surface.uniforms();
        const unitUniforms = this._inherit("unit").getUnitUniforms();
        // Darken wireframe if needed for contrast
        // Auto z-bias wireframe over surface
        wireUniforms.styleColor = this._attributes.make(this._types.color());
        wireUniforms.styleZBias = this._attributes.make(this._types.number());
        this.wireColor = wireUniforms.styleColor.value;
        this.wireZBias = wireUniforms.styleZBias;
        this.wireScratch = new Color();
        // Fetch geometry dimensions
        const dims = this.bind.points.getDimensions();
        const { width, height, depth, items } = dims;
        // Get display properties
        const { shaded, fill, lineX, lineY, closedX, closedY, stroke, join, proximity, crossed, } = this.props;
        const objects = [];
        this.proximity = proximity;
        // Build color lookup
        if (this.bind.colors) {
            color = this._shaders.shader();
            this.bind.colors.sourceShader(color);
        }
        // Build transition mask lookup
        const mask = this._helpers.object.mask();
        // Build texture map lookup
        const map = this._helpers.shade.map(this.bind.map != null
            ? this.bind.map.sourceShader(this._shaders.shader())
            : undefined);
        // Build fragment material lookup
        const material = this._helpers.shade.pipeline();
        const faceMaterial = material || shaded;
        const lineMaterial = material || false;
        // Make line and surface renderables
        const { swizzle, swizzle2 } = this._helpers.position;
        let uniforms = UJS.merge(unitUniforms, lineUniforms, styleUniforms, wireUniforms);
        const zUnits = lineX || lineY ? -50 : 0;
        if (lineX) {
            this.lineX = this._renderables.make("line", {
                uniforms,
                samples: width,
                strips: height,
                ribbons: depth,
                layers: items,
                position,
                color,
                zUnits: -zUnits,
                stroke,
                join,
                mask,
                material: lineMaterial,
                proximity,
                closed: closedX || closed,
            });
            objects.push(this.lineX);
        }
        if (lineY) {
            this.lineY = this._renderables.make("line", {
                uniforms,
                samples: height,
                strips: width,
                ribbons: depth,
                layers: items,
                position: swizzle2(position, "yxzw", "yxzw"),
                color: swizzle(color, "yxzw"),
                zUnits: -zUnits,
                stroke,
                join,
                mask: swizzle(mask, crossed ? "xyzw" : "yxzw"),
                material: lineMaterial,
                proximity,
                closed: closedY || closed,
            });
            objects.push(this.lineY);
        }
        if (fill) {
            uniforms = UJS.merge(unitUniforms, surfaceUniforms, styleUniforms);
            this.surface = this._renderables.make("surface", {
                uniforms,
                width,
                height,
                surfaces: depth,
                layers: items,
                position,
                color,
                zUnits,
                stroke,
                material: faceMaterial,
                mask,
                map,
                intUV: true,
                closedX: closedX || closed,
                closedY: closedY || closed,
            });
            objects.push(this.surface);
        }
        this._helpers.visible.make();
        return this._helpers.object.make(objects);
    }
    made() {
        return this.resize();
    }
    unmake() {
        this._helpers.bind.unmake();
        this._helpers.visible.unmake();
        this._helpers.object.unmake();
        return (this.lineX = this.lineY = this.surface = null);
    }
    _convertGammaToLinear(color, gammaFactor = 2.0) {
        color.r = Math.pow(color.r, gammaFactor);
        color.g = Math.pow(color.g, gammaFactor);
        color.b = Math.pow(color.b, gammaFactor);
        return color;
    }
    _convertLinearToGamma(color, gammaFactor = 2.0) {
        const safeInverse = gammaFactor > 0 ? 1.0 / gammaFactor : 1.0;
        color.r = Math.pow(color.r, safeInverse);
        color.g = Math.pow(color.g, safeInverse);
        color.b = Math.pow(color.b, safeInverse);
        return color;
    }
    change(changed, touched, init) {
        if (changed["geometry.points"] ||
            changed["mesh.shaded"] ||
            changed["mesh.fill"] ||
            changed["line.stroke"] ||
            changed["line.join"] ||
            touched["grid"]) {
            return this.rebuild();
        }
        if (changed["style.color"] ||
            changed["style.zBias"] ||
            changed["mesh.fill"] ||
            changed["mesh.lineBias"] ||
            init) {
            const { fill, color, zBias, lineBias } = this.props;
            this.wireZBias.value = zBias + (fill ? lineBias : 0);
            this.wireColor.copy(color);
            if (fill) {
                const c = this.wireScratch;
                c.setRGB(color.x, color.y, color.z);
                this._convertLinearToGamma(this._convertGammaToLinear(c).multiplyScalar(0.75));
                this.wireColor.x = c.r;
                this.wireColor.y = c.g;
                this.wireColor.z = c.b;
            }
        }
        if (changed["line.proximity"]) {
            if ((this.proximity != null) !== (this.props.proximity != null)) {
                return this.rebuild();
            }
        }
    }
}
Surface.initClass();

// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { SurfaceGeometry } from "./surfacegeometry.js";
import { Vector4 } from "three/src/math/Vector4.js";
/*
Grid Surface in normalized screen space

+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+

+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
*/
export class ScreenGeometry extends SurfaceGeometry {
    constructor(options) {
        options.width = Math.max(2, +options.width != null ? +options.width : 2);
        options.height = Math.max(2, +options.height != null ? +options.height : 2);
        super(options, false);
        if (this.uniforms == null) {
            this.uniforms = {};
        }
        this.uniforms.geometryScale = {
            type: "v4",
            value: new Vector4(),
        };
        this.cover();
        this.construct(options);
    }
    cover(scaleX, scaleY, scaleZ, scaleW) {
        if (scaleX == null) {
            scaleX = 1;
        }
        this.scaleX = scaleX;
        if (scaleY == null) {
            scaleY = 1;
        }
        this.scaleY = scaleY;
        if (scaleZ == null) {
            scaleZ = 1;
        }
        this.scaleZ = scaleZ;
        if (scaleW == null) {
            scaleW = 1;
        }
        this.scaleW = scaleW;
    }
    clip(width, height, surfaces, layers) {
        if (width == null) {
            ({ width } = this);
        }
        if (height == null) {
            ({ height } = this);
        }
        if (surfaces == null) {
            ({ surfaces } = this);
        }
        if (layers == null) {
            ({ layers } = this);
        }
        super.clip(width, height, surfaces, layers);
        const invert = (x) => 1 / Math.max(1, x - 1);
        return this.uniforms.geometryScale.value.set(invert(width) * this.scaleX, invert(height) * this.scaleY, invert(surfaces) * this.scaleZ, invert(layers) * this.scaleW);
    }
}

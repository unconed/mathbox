// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Voxel } from "./voxel.js";
export class Volume extends Voxel {
    static initClass() {
        this.traits = [
            "node",
            "buffer",
            "active",
            "data",
            "source",
            "index",
            "texture",
            "voxel",
            "span:x",
            "span:y",
            "span:z",
            "volume",
            "sampler:x",
            "sampler:y",
            "sampler:z",
            "raw",
        ];
    }
    updateSpan() {
        let inverseX, inverseY, inverseZ;
        const dimensions = this.props.axes;
        let { width } = this.props;
        let { height } = this.props;
        let { depth } = this.props;
        const { centeredX } = this.props;
        const { centeredY } = this.props;
        const { centeredZ } = this.props;
        const padX = this.props.paddingX;
        const padY = this.props.paddingY;
        const padZ = this.props.paddingZ;
        const rangeX = this._helpers.span.get("x.", dimensions[0]);
        const rangeY = this._helpers.span.get("y.", dimensions[1]);
        const rangeZ = this._helpers.span.get("z.", dimensions[2]);
        this.aX = rangeX.x;
        this.aY = rangeY.x;
        this.aZ = rangeZ.x;
        const spanX = rangeX.y - rangeX.x;
        const spanY = rangeY.y - rangeY.x;
        const spanZ = rangeZ.y - rangeZ.x;
        width += padX * 2;
        height += padY * 2;
        depth += padZ * 2;
        if (centeredX) {
            inverseX = 1 / Math.max(1, width);
            this.aX += (spanX * inverseX) / 2;
        }
        else {
            inverseX = 1 / Math.max(1, width - 1);
        }
        if (centeredY) {
            inverseY = 1 / Math.max(1, height);
            this.aY += (spanY * inverseY) / 2;
        }
        else {
            inverseY = 1 / Math.max(1, height - 1);
        }
        if (centeredZ) {
            inverseZ = 1 / Math.max(1, depth);
            this.aZ += (spanZ * inverseZ) / 2;
        }
        else {
            inverseZ = 1 / Math.max(1, depth - 1);
        }
        this.bX = spanX * inverseX;
        this.bY = spanY * inverseY;
        this.bZ = spanZ * inverseZ;
        this.aX += this.bX * padX;
        this.aY += this.bY * padY;
        return (this.aZ += this.bZ * padY);
    }
    callback(callback) {
        this.updateSpan();
        if (this.last === callback) {
            return this._callback;
        }
        this.last = callback;
        if (callback.length <= 7) {
            return (this._callback = (emit, i, j, k) => {
                const x = this.aX + this.bX * i;
                const y = this.aY + this.bY * j;
                const z = this.aZ + this.bZ * k;
                return callback(emit, x, y, z, i, j, k);
            });
        }
        else {
            return (this._callback = (emit, i, j, k) => {
                const x = this.aX + this.bX * i;
                const y = this.aY + this.bY * j;
                const z = this.aZ + this.bZ * k;
                return callback(emit, x, y, z, i, j, k, this.bufferClock, this.bufferStep);
            });
        }
    }
    make() {
        super.make();
        this._helpers.span.make();
        return this._listen(this, "span.range", this.updateSpan);
    }
    unmake() {
        super.unmake();
        return this._helpers.span.unmake();
    }
}
Volume.initClass();

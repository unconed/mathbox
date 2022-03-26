// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as UData from "../../util/data.js";
import { DataBuffer } from "./databuffer.js";
//
// 3D array
//
export class VoxelBuffer extends DataBuffer {
    build(_options) {
        super.build();
        this.pad = { x: 0, y: 0, z: 0 };
        return (this.streamer = this.generate(this.data));
    }
    setActive(i, j, k) {
        let ref;
        return (([this.pad.x, this.pad.y, this.pad.z] = Array.from((ref = [
            Math.max(0, this.width - i),
            Math.max(0, this.height - j),
            Math.max(0, this.depth - k),
        ]))),
            ref);
    }
    fill() {
        let j, k, l, repeat;
        const { callback } = this;
        if (typeof callback.reset === "function") {
            callback.reset();
        }
        const { emit, skip, count, done, reset } = this.streamer;
        reset();
        const n = this.width;
        const m = this.height;
        const padX = this.pad.x;
        const padY = this.pad.y;
        const limit = this.samples - this.pad.z * n * m;
        let i = (j = k = l = 0);
        if (padX > 0 || padY > 0) {
            while (!done() && l < limit) {
                l++;
                repeat = callback(emit, i, j, k);
                if (++i === n - padX) {
                    skip(padX);
                    i = 0;
                    if (++j === m - padY) {
                        skip(n * padY);
                        j = 0;
                        k++;
                    }
                }
                if (repeat === false) {
                    break;
                }
            }
        }
        else {
            while (!done() && l < limit) {
                l++;
                repeat = callback(emit, i, j, k);
                if (++i === n) {
                    i = 0;
                    if (++j === m) {
                        j = 0;
                        k++;
                    }
                }
                if (repeat === false) {
                    break;
                }
            }
        }
        return Math.floor(count() / this.items);
    }
    through(callback, target) {
        // must be identical sized buffers w/ identical active areas
        let dst, j, k, src;
        const { consume, done, skip } = (src = this.streamer);
        const { emit } = (dst = target.streamer);
        let i = (j = k = 0);
        let pipe = () => consume((x, y, z, w) => callback(emit, x, y, z, w, i, j, k));
        pipe = UData.repeatCall(pipe, this.items);
        return () => {
            let l;
            src.reset();
            dst.reset();
            const n = this.width;
            const m = this.height;
            const padX = this.pad.x;
            const padY = this.pad.y;
            const limit = this.samples - this.pad.z * n * m;
            i = j = k = l = 0;
            if (padX > 0 || padY > 0) {
                while (!done() && l < limit) {
                    l++;
                    pipe();
                    if (++i === n - padX) {
                        skip(padX);
                        i = 0;
                        if (++j === m - padY) {
                            skip(n * padY);
                            j = 0;
                            k++;
                        }
                    }
                }
            }
            else {
                while (!done() && l < limit) {
                    l++;
                    pipe();
                    if (++i === n) {
                        i = 0;
                        if (++j === m) {
                            j = 0;
                            k++;
                        }
                    }
                }
            }
            return src.count();
        };
    }
}

// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Atlas } from "./atlas.js";
import { UnsignedByteType } from "three/src/constants.js";
const SCRATCH_SIZE = 512 / 16;
/*
 * Dynamic text atlas
 * - Stores entire strings as sprites
 * - Renders alpha mask (fast) or signed distance field (slow)
 * - Emits (x,y,width,height) pointers into the atlas
 */
export class TextAtlas extends Atlas {
    constructor(renderer, shaders, options) {
        let left;
        if (!options.width) {
            options.width = 256;
        }
        if (!options.height) {
            options.height = 256;
        }
        options.type = UnsignedByteType;
        options.channels = 1;
        options.backed = true;
        super(renderer, shaders, options, false);
        this.font = options.font != null ? options.font : ["sans-serif"];
        this.size = options.size || 24;
        this.style = options.style != null ? options.style : "normal";
        this.variant = options.variant != null ? options.variant : "normal";
        this.weight = options.weight != null ? options.weight : "normal";
        this.outline =
            (left = +(options.outline != null ? options.outline : 5)) != null
                ? left
                : 0;
        this.gamma = 1;
        if (typeof navigator !== "undefined") {
            const ua = navigator.userAgent;
            if (ua.match(/Chrome/) && ua.match(/OS X/)) {
                this.gamma = 0.5;
            }
        }
        this.scratchW = this.scratchH = 0;
        this.build(options);
    }
    build(options) {
        super.build(options);
        // Prepare line-height with room for outline
        let lineHeight = 16;
        lineHeight = this.size;
        lineHeight += 4 + 2 * Math.min(1, this.outline);
        const maxWidth = SCRATCH_SIZE * lineHeight;
        // Prepare scratch canvas
        const canvas = document.createElement("canvas");
        canvas.width = maxWidth;
        canvas.height = lineHeight;
        const quote = (str) => `${str.replace(/(['"\\])/g, "\\$1")}`;
        const font = this.font.map(quote).join(", ");
        const context = canvas.getContext("2d");
        context.font = `${this.style} ${this.variant} ${this.weight} ${this.size}px ${font}`;
        context.fillStyle = "#FF0000";
        context.textAlign = "left";
        context.textBaseline = "bottom";
        context.lineJoin = "round";
        // debug: show scratch canvas
        /*
        document.body.appendChild canvas
        canvas.setAttribute('style', "position: absolute; top: 0; left: 0; z-index: 100; border: 1px solid red; background: rgba(255,0,255,.25);")
        */
        // Cache hex colors for distance field rendering
        const colors = [];
        const dilate = this.outline * 3;
        for (let i = 0, end = dilate, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
            // 8 rgb levels = 1 step = .5 pixel increase
            const hex = ("00" + Math.max(0, -i * 8 + 128 - !i * 8).toString(16)).slice(-2);
            colors.push("#" + hex + hex + hex);
        }
        const scratch = new Uint8Array(maxWidth * lineHeight * 2);
        this.canvas = canvas;
        this.context = context;
        this.lineHeight = lineHeight;
        this.maxWidth = maxWidth;
        this.colors = colors;
        this.scratch = scratch;
        this._allocate = this.allocate.bind(this);
        return (this._write = this.write.bind(this));
    }
    reset() {
        super.reset();
        return (this.mapped = {});
    }
    begin() {
        return Array.from(this.rows).map((row) => (row.alive = 0));
    }
    end() {
        const { mapped } = this;
        for (const row of Array.from(this.rows.slice())) {
            if (row.alive === 0) {
                for (const key of Array.from(row.keys)) {
                    delete mapped[key];
                }
                this.collapse(row);
            }
        }
    }
    map(text, emit) {
        // See if already mapped into atlas
        const { mapped } = this;
        const c = mapped[text];
        if (c != null) {
            c.row.alive++;
            return emit(c.x, c.y, c.w, c.h);
        }
        // Draw text (don't recurse stack in @draw so it can be optimized cleanly)
        this.draw(text);
        const data = this.scratch;
        const w = this.scratchW;
        const h = this.scratchH;
        // Allocate and write into atlas
        const allocate = this._allocate;
        const write = this._write;
        return allocate(text, w, h, function (row, x, y) {
            mapped[text] = { x, y, w, h, row };
            write(data, x, y, w, h);
            return emit(x, y, w, h);
        });
    }
    draw(text) {
        let data, i, j;
        let w = this.width;
        const h = this.lineHeight;
        const o = this.outline;
        const ctx = this.context;
        const dst = this.scratch;
        const max = this.maxWidth;
        const { colors } = this;
        // Bottom aligned
        const x = o + 1;
        const y = Math.round(h * 1.05 - 1);
        // Measure text
        const m = ctx.measureText(text);
        w = Math.min(max, Math.ceil(m.width + 2 * x + 1));
        // Clear scratch area
        ctx.clearRect(0, 0, w, h);
        if (this.outline === 0) {
            // Alpha sprite (fast)
            let asc, end;
            ctx.fillText(text, x, y);
            ({ data } = ctx.getImageData(0, 0, w, h));
            j = 3; // Skip to alpha channel
            for (i = 0, end = data.length / 4, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                //dst[i] = 255 * (i%2); # test pattern to check pixel perfect alignment
                dst[i] = data[j];
                j += 4;
            }
            this.scratchW = w;
            return (this.scratchH = h);
        }
        else {
            // Signed distance field sprite (approximation) (slow)
            // Draw strokes of decreasing width to create nested outlines (absolute distance)
            let asc1, start;
            let asc2, end1;
            ctx.globalCompositeOperation = "source-over";
            for (start = o + 1, i = start, asc1 = start <= 1; asc1 ? i <= 1 : i >= 1; asc1 ? i++ : i--) {
                j = i > 1 ? i * 2 - 2 : i; // Eliminate odd strokes once past > 1px, don't need the detail
                ctx.strokeStyle = colors[j - 1];
                ctx.lineWidth = j;
                ctx.strokeText(text, x, y);
            }
            //console.log 'stroke', j, j+.5, colors[j]
            // Fill center with multiply blend #FF0000 to mark inside/outside
            ctx.globalCompositeOperation = "multiply";
            ctx.fillText(text, x, y);
            // Pull image data
            ({ data } = ctx.getImageData(0, 0, w, h));
            j = 0;
            const { gamma } = this;
            for (i = 0, end1 = data.length / 4, asc2 = 0 <= end1; asc2 ? i < end1 : i > end1; asc2 ? i++ : i--) {
                // Get value + mask
                const a = data[j];
                let mask = a ? data[j + 1] / a : 1;
                if (gamma === 0.5) {
                    mask = Math.sqrt(mask);
                }
                mask = Math.min(1, Math.max(0, mask));
                // Blend between positive/outside and negative/inside
                const b = 256 - a;
                const c = b + (a - b) * mask;
                // Clamp
                // (slight expansion to hide errors around the transition)
                dst[i] = Math.max(0, Math.min(255, c + 2));
                j += 4;
            }
            // Debug: copy back into canvas
            //
            // TODO hide behind debug flag or delete.
            /*
            j = 0
            for i in [0...data.length / 4]
              v = dst[i]
              *data[j] = v
              *data[j+1] = v
              data[j+2] = v
              data[j+3] = 255
              j += 4
            ctx.putImageData(imageData, 0, 0);
            */
            this.scratchW = w;
            return (this.scratchH = h);
        }
    }
}

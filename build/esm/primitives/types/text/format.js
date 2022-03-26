// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { FloatType, NearestFilter } from "three/src/constants.js";
import { Operator } from "../operator/operator.js";
export class Format extends Operator {
    static initClass() {
        this.traits = [
            "node",
            "bind",
            "operator",
            "texture",
            "text",
            "format",
            "font",
        ];
        this.defaults = {
            minFilter: "linear",
            magFilter: "linear",
        };
    }
    init() {
        super.init();
        this.atlas = this.buffer = this.used = this.time = null;
        return (this.filled = false);
    }
    sourceShader(shader) {
        return this.buffer.shader(shader);
    }
    textShader(shader) {
        return this.atlas.shader(shader);
    }
    textIsSDF() {
        return this.props.sdf > 0;
    }
    textHeight() {
        return this.props.detail;
    }
    make() {
        // Bind to attached data sources    # super()
        this._helpers.bind.make([{ to: "operator.source", trait: "raw" }]);
        // Read sampling parameters
        let { minFilter, magFilter, type } = this.props;
        // Read font parameters
        const { font, style, variant, weight, detail, sdf } = this.props;
        // Prepare text atlas
        this.atlas = this._renderables.make("textAtlas", {
            font,
            size: detail,
            style,
            variant,
            weight,
            outline: sdf,
            minFilter,
            magFilter,
            type,
        });
        // Underlying data buffer needs no filtering
        minFilter = NearestFilter;
        magFilter = NearestFilter;
        type = FloatType;
        // Fetch geometry dimensions
        const dims = this.bind.source.getDimensions();
        const { items, width, height, depth } = dims;
        // Create voxel buffer for text atlas coords
        this.buffer = this._renderables.make("voxelBuffer", {
            width,
            height,
            depth,
            channels: 4,
            items,
            minFilter,
            magFilter,
            type,
        });
        // Hook buffer emitter to map atlas text
        const { atlas } = this;
        const { emit } = this.buffer.streamer;
        this.buffer.streamer.emit = (t) => atlas.map(t, emit);
        // Grab parent clock
        this.clockParent = this._inherit("clock");
        return this._listen("root", "root.update", this.update);
    }
    made() {
        super.made();
        return this.resize();
    }
    unmake() {
        super.unmake();
        if (this.buffer) {
            this.buffer.dispose();
            this.buffer = null;
        }
        if (this.atlas) {
            this.atlas.dispose();
            return (this.atlas = null);
        }
    }
    update() {
        if ((this.filled && !this.props.live) || !this.through) {
            return;
        }
        this.time = this.clockParent.getTime();
        const { used } = this;
        this.atlas.begin();
        this.used = this.through();
        this.buffer.write(this.used);
        this.atlas.end();
        this.filled = true;
        if (used !== this.used) {
            return this.trigger({
                type: "source.resize",
            });
        }
    }
    change(changed, touched, init) {
        if (touched["font"]) {
            return this.rebuild();
        }
        if (changed["format.expr"] ||
            changed["format.digits"] ||
            changed["format.data"] ||
            init) {
            let map;
            let { expr } = this.props;
            const { digits, data } = this.props;
            if (expr == null) {
                if (data != null) {
                    expr = (x, y, z, w, i) => data[i];
                }
                else {
                    expr = (x) => x;
                }
            }
            const { length } = expr;
            if (digits != null) {
                expr = ((expr) => (x, y, z, w, i, j, k, l, t, d) => +expr(x, y, z, w, i, j, k, l, t, d).toPrecision(digits))(expr);
            }
            // Stream raw source data and format it with expression
            if (length > 8) {
                map = (emit, x, y, z, w, i, j, k, l, _t, _d) => {
                    return emit(expr(x, y, z, w, i, j, k, l, this.time.clock, this.time.step));
                };
            }
            else {
                map = (emit, x, y, z, w, i, j, k, l) => {
                    return emit(expr(x, y, z, w, i, j, k, l));
                };
            }
            return (this.through = this.bind.source
                .rawBuffer()
                .through(map, this.buffer));
        }
    }
}
Format.initClass();

// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as UData from "../../../util/data.js";
import { Buffer } from "./buffer.js";
export class Array_ extends Buffer {
    static initClass() {
        this.traits = [
            "node",
            "buffer",
            "active",
            "data",
            "source",
            "index",
            "array",
            "texture",
            "raw",
        ];
    }
    init() {
        this.buffer = this.spec = null;
        this.space = {
            width: 0,
            history: 0,
        };
        this.used = { width: 0 };
        this.storage = "arrayBuffer";
        this.passthrough = (emit, x) => emit(x, 0, 0, 0);
        return super.init();
    }
    sourceShader(shader) {
        const dims = this.getDimensions();
        this.alignShader(dims, shader);
        return this.buffer.shader(shader);
    }
    getDimensions() {
        return {
            items: this.items,
            width: this.space.width,
            height: this.space.history,
            depth: 1,
        };
    }
    getActiveDimensions() {
        return {
            items: this.items,
            width: this.used.width,
            height: this.buffer.getFilled(),
            depth: 1,
        };
    }
    getFutureDimensions() {
        return {
            items: this.items,
            width: this.used.width,
            height: this.space.history,
            depth: 1,
        };
    }
    getRawDimensions() {
        return {
            items: this.items,
            width: this.space.width,
            height: 1,
            depth: 1,
        };
    }
    make() {
        super.make();
        // Read sampling parameters
        const minFilter = this.minFilter != null ? this.minFilter : this.props.minFilter;
        const magFilter = this.magFilter != null ? this.magFilter : this.props.magFilter;
        const type = this.type != null ? this.type : this.props.type;
        // Read given dimensions
        const { width } = this.props;
        const { history } = this.props;
        const reserve = this.props.bufferWidth;
        const { channels } = this.props;
        const { items } = this.props;
        let dims = (this.spec = { channels, items, width });
        this.items = dims.items;
        this.channels = dims.channels;
        // Init to right size if data supplied
        const { data } = this.props;
        dims = UData.getDimensions(data, dims);
        const { space } = this;
        space.width = Math.max(reserve, dims.width || 1);
        space.history = history;
        // Create array buffer
        return (this.buffer = this._renderables.make(this.storage, {
            width: space.width,
            history: space.history,
            channels,
            items,
            minFilter,
            magFilter,
            type,
        }));
    }
    unmake() {
        super.unmake();
        if (this.buffer) {
            this.buffer.dispose();
            return (this.buffer = this.spec = null);
        }
    }
    change(changed, touched, init) {
        if (touched["texture"] ||
            changed["history.history"] ||
            changed["buffer.channels"] ||
            changed["buffer.items"] ||
            changed["array.bufferWidth"]) {
            return this.rebuild();
        }
        if (!this.buffer) {
            return;
        }
        if (changed["array.width"]) {
            const { width, bufferWidth } = this.props;
            if (width > bufferWidth) {
                return this.rebuild();
            }
        }
        if (changed["data.map"] ||
            changed["data.data"] ||
            changed["data.resolve"] ||
            changed["data.expr"] ||
            init) {
            return this.buffer.setCallback(this.emitter());
        }
    }
    callback(callback) {
        if (callback.length <= 2) {
            return callback;
        }
        else {
            return (emit, i) => {
                return callback(emit, i, this.bufferClock, this.bufferStep);
            };
        }
    }
    update() {
        if (!this.buffer) {
            return;
        }
        const { data } = this.props;
        const { space, used } = this;
        const l = used.width;
        const filled = this.buffer.getFilled();
        this.syncBuffer((abort) => {
            if (data != null) {
                const dims = UData.getDimensions(data, this.spec);
                // Grow width if needed
                if (dims.width > space.width) {
                    abort();
                    return this.rebuild();
                }
                used.width = dims.width;
                this.buffer.setActive(used.width);
                if (typeof this.buffer.callback.rebind === "function") {
                    this.buffer.callback.rebind(data);
                }
                return this.buffer.update();
            }
            else {
                let width = this.spec.width || 1;
                this.buffer.setActive(width);
                width = this.buffer.update();
                return (used.width = width);
            }
        });
        if (used.width !== l || filled !== this.buffer.getFilled()) {
            return this.trigger({
                type: "source.resize",
            });
        }
    }
}
Array_.initClass();

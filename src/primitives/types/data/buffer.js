// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Data } from "./data.js";

export class Buffer extends Data {
  static initClass() {
    this.traits = [
      "node",
      "buffer",
      "active",
      "data",
      "source",
      "index",
      "texture",
    ];
  }

  init() {
    this.bufferSlack = 0;
    this.bufferFrames = 0;

    this.bufferTime = 0;
    this.bufferDelta = 0;

    this.bufferClock = 0;
    this.bufferStep = 0;
    super.init();
  }

  make() {
    super.make();

    this.clockParent = this._inherit("clock");
    this.latchParent = this._inherit("latch");
  }

  unmake() {
    return super.unmake();
  }

  rawBuffer() {
    return this.buffer;
  }

  emitter() {
    const { channels, items } = this.props;

    return super.emitter(channels, items);
  }

  change(changed, touched, init) {
    if (changed["buffer.fps"] || init) {
      const { fps } = this.props;
      return (this.bufferSlack = fps ? 0.5 / fps : 0);
    }
  }

  syncBuffer(callback) {
    let delta, step;
    if (!this.buffer) {
      return;
    }
    const { live, fps, hurry, limit, realtime, observe } = this.props;

    const filled = this.buffer.getFilled();
    if (filled && !live) {
      return;
    }
    if (this.latchParent && !this.latchParent.isDirty) {
      return;
    }

    const time = this.clockParent.getTime();

    if (fps != null) {
      const slack = this.bufferSlack;
      const speed = time.step / time.delta;
      delta = realtime ? time.delta : time.step;
      const frame = 1 / fps;
      step = realtime && observe ? speed * frame : frame;

      if (Math.abs(time.time - this.bufferTime) > time.step * limit) {
        this.bufferTime = time.time;
        this.bufferClock = time.clock;
      }

      this.bufferSlack = Math.min(limit / fps, slack + delta);
      this.bufferDelta = delta;
      this.bufferStep = step;

      let frames = Math.min(hurry, Math.floor(slack * fps));
      if (!filled) {
        frames = Math.max(1, frames);
      }

      let stop = false;
      const abort = () => (stop = true);
      return (() => {
        const result = [];
        for (
          let i = 0, end = frames, asc = 0 <= end;
          asc ? i < end : i > end;
          asc ? i++ : i--
        ) {
          this.bufferTime += delta;
          this.bufferClock += step;

          if (stop) {
            break;
          }
          callback(abort, this.bufferFrames++, i, frames);

          result.push((this.bufferSlack -= frame));
        }
        return result;
      })();
    } else {
      this.bufferTime = time.time;
      this.bufferDelta = time.delta;
      this.bufferClock = time.clock;
      this.bufferStep = time.step;
      return callback(function () {}, this.bufferFrames++, 0, 1);
    }
  }

  alignShader(dims, shader) {
    const { minFilter, magFilter, aligned } = this.props;
    const mixed =
      (dims.items > 1 && dims.width > 1) || (dims.height > 1 && dims.depth > 1);

    if (aligned || !mixed) {
      return;
    }

    const nearest =
      minFilter === this.node.attributes["texture.minFilter"].enum.nearest &&
      magFilter === this.node.attributes["texture.magFilter"].enum.nearest;

    if (!nearest) {
      console.warn(
        `${this.node.toString()} - Cannot use linear min/magFilter with 3D/4D sampling`
      );
    }

    return shader.pipe("map.xyzw.align");
  }
}
Buffer.initClass();

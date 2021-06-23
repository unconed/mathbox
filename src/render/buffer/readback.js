// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as THREE from "three";
import * as UData from "../../util/data";
import * as UGLSL from "../../util/glsl";
import { Memo } from "./memo";
import { MemoScreen } from "../meshes/memoscreen";
import { Renderable } from "../renderable";

/*
 * Readback up to 4D array of up to 4D data from GL
 */
export class Readback extends Renderable {
  constructor(renderer, shaders, options) {
    super(renderer, shaders);

    if (this.items == null) {
      this.items = options.items || 1;
    }
    if (this.channels == null) {
      this.channels = options.channels || 4;
    }
    if (this.width == null) {
      this.width = options.width || 1;
    }
    if (this.height == null) {
      this.height = options.height || 1;
    }
    if (this.depth == null) {
      this.depth = options.depth || 1;
    }
    if (this.type == null) {
      this.type = options.type || THREE.FloatType;
    }
    if (this.stpq == null) {
      this.stpq = options.stpq || false;
    }
    this.isFloat = this.type === THREE.FloatType;

    this.active = this.sampled = this.rect = this.pad = null;

    this.build(options);

    /*
    * log precision
    gl = @gl
    for name, pass of {Vertex: gl.VERTEX_SHADER, Fragment: gl.FRAGMENT_SHADER}
      bits = for prec in [gl.LOW_FLOAT, gl.MEDIUM_FLOAT, gl.HIGH_FLOAT]
        gl.getShaderPrecisionFormat(pass, prec).precision
      console.log name, 'shader precision',  bits
    */
  }

  build(options) {
    let channels, encoder, stretch;
    const { map } = options;
    const { indexer } = options;
    const isIndexed = indexer != null && !indexer.empty();

    let { items, width, height, depth, stpq } = this;

    let sampler = map;
    if (isIndexed) {
      // Preserve original xyzw offset of datapoint to tie it back to the source

      // Modulus to pack xyzw into a single integer index
      this._adopt({
        indexModulus: {
          type: "v4",
          value: new THREE.Vector4(
            items,
            items * width,
            items * width * height,
            1
          ),
        },
      });

      // Build shader to pack XYZ + index into a single RGBA
      sampler = this.shaders.shader();
      sampler.require(map);
      sampler.require(indexer);
      //sampler.require UGLSL.identity 'vec4'
      sampler.pipe("float.index.pack", this.uniforms);
    }

    if (this.isFloat && this.channels > 1) {
      // Memoize multi-channel float data into float buffer first
      this.floatMemo = new Memo(this.renderer, this.shaders, {
        items,
        channels: 4, // non-RGBA render target not supported
        width,
        height,
        depth,
        history: 0,
        type: THREE.FloatType,
      });

      this.floatCompose = new MemoScreen(this.renderer, this.shaders, {
        map: sampler,
        items,
        width,
        height,
        depth,
        stpq,
      });

      this.floatMemo.adopt(this.floatCompose);

      // Second pass won't need texture coordinates
      stpq = false;

      // Replace sampler with memoized sampler
      sampler = this.shaders.shader();
      this.floatMemo.shaderAbsolute(sampler);
    }

    if (this.isFloat) {
      // Encode float data into byte buffer
      stretch = this.channels;
      channels = 4; // one 32-bit float per pixel
    } else {
      // Render byte data directly
      stretch = 1;
      ({ channels } = this);
    }

    if (stretch > 1) {
      // Stretch horizontally, sampling once per channel
      encoder = this.shaders.shader();
      encoder.pipe(UGLSL.mapByte2FloatOffset(stretch));
      encoder.require(sampler);
      encoder.pipe("float.stretch");
      encoder.pipe("float.encode");
      sampler = encoder;
    } else if (this.isFloat) {
      // Direct sampling
      encoder = this.shaders.shader();
      encoder.pipe(sampler);
      encoder.pipe(UGLSL.truncateVec4(4, 1));
      encoder.pipe("float.encode");
      sampler = encoder;
    }

    // Memoize byte data
    this.byteMemo = new Memo(this.renderer, this.shaders, {
      items: items * stretch,
      channels: 4, // non-RGBA render target not supported
      width,
      height,
      depth,
      history: 0,
      type: THREE.UnsignedByteType,
    });

    this.byteCompose = new MemoScreen(this.renderer, this.shaders, {
      map: sampler,
      items: items * stretch,
      width,
      height,
      depth,
      stpq,
    });

    this.byteMemo.adopt(this.byteCompose);

    // CPU-side buffers
    const w = items * width * stretch;
    const h = height * depth;

    this.samples = this.width * this.height * this.depth;

    this.bytes = new Uint8Array(w * h * 4); // non-RGBA render target not supported
    if (this.isFloat) {
      this.floats = new Float32Array(this.bytes.buffer);
    }
    this.data = this.isFloat ? this.floats : this.bytes;
    this.streamer = this.generate(this.data);

    this.active = { items: 0, width: 0, height: 0, depth: 0 };
    this.sampled = { items: 0, width: 0, height: 0, depth: 0 };
    this.rect = { w: 0, h: 0 };
    this.pad = { x: 0, y: 0, z: 0, w: 0 };

    this.stretch = stretch;
    this.isIndexed = isIndexed;

    return this.setActive(items, width, height, depth);
  }

  generate(data) {
    return UData.getStreamer(data, this.samples, 4, this.items);
  } // non-RGBA render target not supported

  setActive(items, width, height, depth) {
    let ref;
    if (
      items === this.active.items &&
      width === this.active.width &&
      height === this.active.height &&
      depth === this.active.depth
    ) {
      return;
    }

    // Actively sampled area
    [
      this.active.items,
      this.active.width,
      this.active.height,
      this.active.depth,
    ] = Array.from([items, width, height, depth]);

    // Render only necessary samples in RTTs
    if (this.floatCompose != null) {
      this.floatCompose.cover(width, height, depth);
    }
    if (this.byteCompose != null) {
      this.byteCompose.cover(width * this.stretch, height, depth);
    }

    // Calculate readback buffer geometry
    ({ items } = this);
    ({ width } = this.active);
    height = this.depth === 1 ? this.active.height : this.height;
    ({ depth } = this.active);
    const w = items * width * this.stretch;
    const h = height * depth;

    // Calculate array paddings on readback
    [
      this.sampled.items,
      this.sampled.width,
      this.sampled.height,
      this.sampled.depth,
    ] = Array.from([items, width, height, depth]);
    [this.rect.w, this.rect.h] = Array.from([w, h]);
    return (
      ([this.pad.x, this.pad.y, this.pad.z, this.pad.w] = Array.from(
        (ref = [
          this.sampled.width - this.active.width,
          this.sampled.height - this.active.height,
          this.sampled.depth - this.active.depth,
          this.sampled.items - this.active.items,
        ])
      )),
      ref
    );
  }

  update(camera) {
    if (this.floatMemo != null) {
      this.floatMemo.render(camera);
    }
    return this.byteMemo != null ? this.byteMemo.render(camera) : undefined;
  }

  post() {
    this.renderer.setRenderTarget(this.byteMemo.target.write);
    return this.gl.readPixels(
      0,
      0,
      this.rect.w,
      this.rect.h,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.bytes
    );
  }

  readFloat(n) {
    return this.floatMemo != null ? this.floatMemo.read(n) : undefined;
  }
  readByte(n) {
    return this.byteMemo != null ? this.byteMemo.read(n) : undefined;
  }

  setCallback(callback) {
    return (this.emitter = this.callback(callback));
  }

  callback(callback) {
    if (!this.isIndexed) {
      return callback;
    }

    const n = this.width;
    const m = this.height;
    const p = this.items;

    // Decode packed index
    const f = function (x, y, z, w) {
      let idx = w;
      const ll = idx % p;
      idx = (idx - ll) / p;
      const ii = idx % n;
      idx = (idx - ii) / n;
      const jj = idx % m;
      idx = (idx - jj) / m;
      const kk = idx;

      return callback(x, y, z, w, ii, jj, kk, ll);
    };

    f.reset = () =>
      typeof callback.reset === "function" ? callback.reset() : undefined;
    return f;
  }

  iterate() {
    let j, k, l;
    let emit = this.emitter;
    if (typeof emit.reset === "function") {
      emit.reset();
    }

    const { consume, skip, count, done, reset } = this.streamer;
    reset();

    const n = this.sampled.width | 0;
    let m = this.sampled.height | 0;
    const o = this.sampled.depth | 0;
    const p = this.sampled.items | 0;
    const padX = this.pad.x | 0;
    const padY = this.pad.y | 0;
    const padZ = this.pad.z | 0;
    const padW = this.pad.w | 0;
    const limit = n * m * p * (o - padZ);

    if (!this.isIndexed) {
      const callback = emit;
      emit = (x, y, z, w) => callback(x, y, z, w, i, j, k, l);
    }

    var i = (j = k = l = m = 0);
    while (!done() && m < limit) {
      m++;
      const repeat = consume(emit);
      if (++l === p - padW) {
        skip(padX);
        l = 0;
        if (++i === n - padX) {
          skip(p * padX);
          i = 0;
          if (++j === m - padY) {
            skip(p * n * padY);
            j = 0;
            k++;
          }
        }
      }
      if (repeat === false) {
        break;
      }
    }

    return Math.floor(count() / p);
  }

  dispose() {
    if (this.floatMemo != null) {
      this.floatMemo.unadopt(this.floatCompose);
    }
    if (this.floatMemo != null) {
      this.floatMemo.dispose();
    }
    if (this.floatCompose != null) {
      this.floatCompose.dispose();
    }

    if (this.byteMemo != null) {
      this.byteMemo.unadopt(this.byteCompose);
    }
    if (this.byteMemo != null) {
      this.byteMemo.dispose();
    }
    if (this.byteCompose != null) {
      this.byteCompose.dispose();
    }

    return (this.floatMemo =
      this.byteMemo =
      this.floatCompose =
      this.byteCompose =
        null);
  }
}

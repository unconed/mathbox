// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as THREE from "three";
import * as UGLSL from "../../util/glsl";
import { BackedTexture } from "./texture/backedtexture";
import { DataTexture } from "./texture/datatexture";
import { Renderable } from "../renderable";

/*
 * Dynamic sprite atlas
 *
 * - Allocates variable-sized sprites in rows
 * - Will grow itself when full
 */
export class Atlas extends Renderable {
  constructor(renderer, shaders, options, build) {
    if (build == null) {
      build = true;
    }
    super(renderer, shaders);

    if (this.width == null) {
      this.width = options.width || 512;
    }
    if (this.height == null) {
      this.height = options.height || 512;
    }
    if (this.channels == null) {
      this.channels = options.channels || 4;
    }
    if (this.backed == null) {
      this.backed = options.backed || false;
    }
    this.samples = this.width * this.height;

    if (build) {
      this.build(options);
    }
  }

  shader(shader) {
    shader.pipe("map.2d.data", this.uniforms);
    shader.pipe("sample.2d", this.uniforms);
    if (this.channels < 4) {
      shader.pipe(
        UGLSL.swizzleVec4(["0000", "x000", "xw00", "xyz0"][this.channels])
      );
    }
    return shader;
  }

  build(options) {
    let klass;
    this.klass = klass = this.backed ? BackedTexture : DataTexture;
    this.texture = new klass(
      this.gl,
      this.width,
      this.height,
      this.channels,
      options
    );

    this.uniforms = {
      dataPointer: {
        type: "v2",
        value: new THREE.Vector2(0, 0),
      },
    };
    this._adopt(this.texture.uniforms);

    return this.reset();
  }

  reset() {
    this.rows = [];
    return (this.bottom = 0);
  }

  resize(width, height) {
    if (!this.backed) {
      throw new Error("Cannot resize unbacked texture atlas");
    }
    if (width > 2048 && height > 2048) {
      console.warn(`Giant text atlas ${width}x${height}.`);
    } else {
      console.info(`Resizing text atlas ${width}x${height}.`);
    }

    this.texture.resize(width, height);

    this.width = width;
    this.height = height;
    return (this.samples = width * height);
  }

  collapse(row) {
    let left;
    const { rows } = this;
    rows.splice(rows.indexOf(row), 1);
    this.bottom =
      (left = __guard__(rows[rows.length - 1], (x) => x.bottom)) != null
        ? left
        : 0;
    if (this.last === row) {
      return (this.last = null);
    }
  }

  allocate(key, width, height, emit) {
    const w = this.width;
    const h = this.height;

    const max = height * 2;

    if (width > w) {
      this.resize(w * 2, h * 2);
      this.last = null;
      // Try again
      return this.allocate(key, width, height, emit);
    }

    // See if we can append to the last used row (fast code path)
    let row = this.last;
    if (row != null) {
      if (row.height >= height && row.height < max && row.width + width <= w) {
        row.append(key, width, height, emit);
        return;
      }
    }

    // Scan all rows and append to the first suitable one (slower code path)
    let bottom = 0;
    let index = -1;
    let top = 0;
    for (let i = 0; i < this.rows.length; i++) {
      // Measure gap between rows
      // Note suitable holes for later
      row = this.rows[i];
      const gap = row.top - bottom;
      if (gap >= height && index < 0) {
        index = i;
        top = bottom;
      }
      ({ bottom } = row);

      if (row.height >= height && row.height < max && row.width + width <= w) {
        row.append(key, width, height, emit);
        this.last = row;
        return;
      }
    }

    // New row (slowest path)
    if (index >= 0) {
      // Fill a gap
      row = new Row(top, height);
      this.rows.splice(index, 0, row);
      //console.log 'fill gap', row
    } else {
      // Append to bottom
      top = bottom;
      bottom += height;

      // Resize if atlas is full
      if (bottom >= h) {
        this.resize(w * 2, h * 2);
        this.last = null;
        // Try again
        return this.allocate(key, width, height, emit);
      }

      // Add new row to the end
      row = new Row(top, height);
      this.rows.push(row);
      this.bottom = bottom;
    }

    row.append(key, width, height, emit);
    this.last = row;
  }

  read() {
    return this.texture.textureObject;
  }

  write(data, x, y, w, h) {
    return this.texture.write(data, x, y, w, h);
  }

  dispose() {
    this.texture.dispose();
    this.data = null;
    return super.dispose();
  }
}

class Row {
  constructor(top, height) {
    this.top = top;
    this.bottom = top + height;
    this.width = 0;
    this.height = height;
    this.alive = 0;
    this.keys = [];
  }

  append(key, width, height, emit) {
    const x = this.width;
    const y = this.top;
    this.alive++;
    this.width += width;
    this.keys.push(key);
    return emit(this, x, y);
  }
}

function __guard__(value, transform) {
  return typeof value !== "undefined" && value !== null
    ? transform(value)
    : undefined;
}

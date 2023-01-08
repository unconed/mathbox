// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import { Geometry } from "./geometry.js";
import { Vector4 } from "three";

// Instanced geometry that is clippable along 4 dimensions
export class ClipGeometry extends Geometry {
  _clipUniforms() {
    this.geometryClip = new Vector4(1e10, 1e10, 1e10, 1e10);
    this.geometryResolution = new Vector4();
    this.mapSize = new Vector4();

    if (this.uniforms == null) {
      this.uniforms = {};
    }
    this.uniforms.geometryClip = {
      type: "v4",
      value: this.geometryClip,
    };
    this.uniforms.geometryResolution = {
      type: "v4",
      value: this.geometryResolution,
    };
    return (this.uniforms.mapSize = {
      type: "v4",
      value: this.mapSize,
    });
  }

  _clipGeometry(width, height, depth, items) {
    const c = (x) => Math.max(0, x - 1);
    const r = (x) => 1 / Math.max(1, x - 1);

    this.geometryClip.set(c(width), c(height), c(depth), c(items));
    return this.geometryResolution.set(r(width), r(height), r(depth), r(items));
  }

  _clipMap(mapWidth, mapHeight, mapDepth, mapItems) {
    return this.mapSize.set(mapWidth, mapHeight, mapDepth, mapItems);
  }

  _clipOffsets(
    factor,
    width,
    height,
    depth,
    items,
    _width,
    _height,
    _depth,
    _items
  ) {
    const dims = [depth, height, width, items];
    const maxs = [_depth, _height, _width, _items];
    const elements = this._reduce(dims, maxs);

    return this._offsets([
      {
        start: 0,
        count: elements * factor,
        materialIndex: 0,
      },
    ]);
  }
}

// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import { Screen } from "./screen.js";
import { Vector2 } from "three/src/math/Vector2.js";
import { Vector4 } from "three/src/math/Vector4.js";

export class MemoScreen extends Screen {
  constructor(renderer, shaders, options) {
    const { items, width, height, depth, stpq } = options;

    const inv = (x) => 1 / Math.max(1, x);
    const inv1 = (x) => 1 / Math.max(1, x - 1);

    const uniforms = {
      remapUVScale: {
        type: "v2",
        value: new Vector2(items * width, height * depth),
      },
      remapModulus: {
        type: "v2",
        value: new Vector2(items, height),
      },
      remapModulusInv: {
        type: "v2",
        value: new Vector2(inv(items), inv(height)),
      },
      remapSTPQScale: {
        type: "v4",
        value: new Vector4(inv1(width), inv1(height), inv1(depth), inv1(items)),
      },
    };

    const map = shaders.shader();
    map.pipe("screen.map.xyzw", uniforms);
    if (options.map != null) {
      // Need artifical STPQs because the screen is not the real geometry
      if (stpq) {
        map.pipe("screen.map.stpq", uniforms);
      }
      map.pipe(options.map);
    }

    super(renderer, shaders, { map, linear: true });
    this.memo = options;
    this.uniforms = uniforms;

    for (const object of Array.from(this.renders)) {
      object.transparent = false;
    }
  }

  cover(width, height, depth, items) {
    if (width == null) {
      ({ width } = this.memo);
    }
    if (height == null) {
      ({ height } = this.memo);
    }
    if (depth == null) {
      ({ depth } = this.memo);
    }
    if (items == null) {
      ({ items } = this.memo);
    }
    const inv1 = (x) => 1 / Math.max(1, x - 1);
    this.uniforms.remapSTPQScale.value.set(
      inv1(width),
      inv1(height),
      inv1(depth),
      inv1(items)
    );

    const x = width / this.memo.width;
    let y = depth / this.memo.depth;
    if (this.memo.depth === 1) {
      y = height / this.memo.height;
    }

    return this.geometry.cover(x, y);
  }
}

// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Threestrap plugin

import "@mentat/threestrap/src/bootstrap";
import * as THREE from "three";

THREE.Bootstrap.registerPlugin("splash", {
  defaults: {
    color: "mono",
    fancy: true,
  },

  listen: [
    "ready",
    "mathbox/init:init",
    "mathbox/progress:progress",
    "mathbox/destroy:destroy",
  ],

  uninstall() {
    return this.destroy();
  },

  ready(event, three) {
    if (three.MathBox && !this.div) {
      // TODO woah seems wrong!!!
      return this.init(event, three);
    }
  },

  init(event, three) {
    let div;
    this.destroy();

    const { color } = this.options;
    const html = `\
<div class="mathbox-loader mathbox-splash-${color}">
  <div class="mathbox-logo">
    <div> <div></div><div></div><div></div> </div>
    <div> <div></div><div></div><div></div> </div>
  </div>
  <div class="mathbox-progress"><div></div></div>
</div>\
`;

    this.div = div = document.createElement("div");
    div.innerHTML = html;
    three.element.appendChild(div);

    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    const z = Math.random() * 2 - 1;
    const l = 1 / Math.sqrt(x * x + y * y + z * z);

    this.loader = div.querySelector(".mathbox-loader");
    this.bar = div.querySelector(".mathbox-progress > div");
    this.gyro = div.querySelectorAll(".mathbox-logo > div");
    this.transforms = [
      "rotateZ(22deg) rotateX(24deg) rotateY(30deg)",
      "rotateZ(11deg) rotateX(12deg) rotateY(15deg) scale3d(.6, .6, .6)",
    ];
    this.random = [x * l, y * l, z * l];
    this.start = three.Time.now;
    return (this.timer = null);
  },

  // Update splash screen state and animation
  progress(event, three) {
    if (!this.div) {
      return;
    }

    const { current, total } = event;

    // Display splash screen
    const visible = current < total;
    clearTimeout(this.timer);
    if (visible) {
      this.loader.classList.remove("mathbox-exit");
      this.loader.style.display = "block";
    } else {
      this.loader.classList.add("mathbox-exit");
      this.timer = setTimeout(() => {
        return (this.loader.style.display = "none");
      }, 150);
    }

    // Update splash progress
    const width =
      current < total
        ? Math.round((1000 * current) / total) * 0.1 + "%"
        : "100%";
    this.bar.style.width = width;

    if (this.options.fancy) {
      // Spinny gyros
      const weights = this.random;

      // Lerp clock speed
      const f = Math.max(0, Math.min(1, three.Time.now - this.start));
      const increment = function (transform, j) {
        if (j == null) {
          j = 0;
        }
        return transform.replace(
          /(-?[0-9.e]+)deg/g,
          (_, n) => +n + weights[j++] * f * three.Time.step * 60 + "deg"
        );
      };

      return (() => {
        const result = [];
        for (let i = 0; i < this.gyro.length; i++) {
          var t;
          const el = this.gyro[i];
          this.transforms[i] = t = increment(this.transforms[i]);
          result.push((el.style.transform = el.style.WebkitTransform = t));
        }
        return result;
      })();
    }
  },

  destroy() {
    if (this.div != null) {
      this.div.remove();
    }
    return (this.div = null);
  },
});

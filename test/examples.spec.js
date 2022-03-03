import * as MathBox from "../src";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

describe("examples", () => {
  it("runs the axis example", () => {
    const mathbox = MathBox.mathBox({
      plugins: ["core", "controls", "cursor"],
      controls: {
        klass: OrbitControls,
      },
      camera: {
        fov: 45,
      },
    });
    const three = mathbox.three;

    three.camera.position.set(-0.15, 0.15, 3.6);
    three.renderer.setClearColor(new THREE.Color(0xffffff), 1.0);

    const colors = {
      x: new THREE.Color(0xff4136),
      y: new THREE.Color(0x2ecc40),
      z: new THREE.Color(0x0074d9),
    };

    const view = mathbox
      .set({
        scale: 720,
        focus: 1,
      })
      .cartesian({
        range: [
          [-2, 2],
          [-1, 1],
          [-1, 1],
        ],
        scale: [2, 1, 1],
      });
    view.axis({
      color: colors.x,
    });
    view.axis({
      axis: 2, // "y" also works
      color: colors.y,
    });
    view.axis({
      axis: 3,
      color: colors.z,
    });

    mathbox
      .select("axis")
      .set("end", true)
      .set("width", 5)
      .bind("depth", function (t) {
        return 0.5 + 0.5 * Math.sin(t * 0.5);
      });

    view.array({
      id: "colors",
      live: false,
      data: [colors.x, colors.y, colors.z].map(function (color) {
        return [color.r, color.g, color.b, 1];
      }),
    });

    view
      .array({
        data: [
          [2, 0, 0],
          [0, 1.11, 0],
          [0, 0, 1],
        ],
        channels: 3, // necessary
        live: false,
      })
      .text({
        data: ["x", "y", "z"],
      })
      .label({
        color: 0xffffff,
        colors: "#colors",
      });
  });

  it("runs the curve example", () => {
    const mathbox = MathBox.mathBox({
      plugins: ["core", "controls", "cursor"],
      controls: {
        klass: OrbitControls,
      },
    });
    const three = mathbox.three;

    three.camera.position.set(0, 0, 3);
    three.renderer.setClearColor(new THREE.Color(0xffffff), 1.0);

    const view = mathbox
      .set({
        focus: 3,
      })
      .cartesian({
        range: [
          [-2, 2],
          [-1, 1],
          [-1, 1],
        ],
        scale: [2, 1, 1],
      });

    view.axis({
      detail: 30,
    });

    view.axis({
      axis: 2,
    });

    view.scale({
      divide: 10,
    });
    view.ticks({
      classes: ["foo", "bar"],
      width: 2,
    });

    view.grid({
      divideX: 30,
      width: 1,
      opacity: 0.5,
      zBias: -5,
    });

    view.interval({
      id: "sampler",
      width: 64,
      expr: function (emit, x, i, t) {
        const y = Math.sin(x + t) * 0.7; // + (i%2)*Math.sin(x * 400000 + t * 5 + x * x * 10000)*.05;
        emit(x, y);
      },
      channels: 2,
    });

    view.line({
      points: "#sampler",
      color: 0x3090ff,
      width: 5,
    });

    view
      .transform({
        position: [0, 0.1, 0],
      })
      .line({
        points: "#sampler",
        color: 0x3090ff,
        width: 5,
        stroke: "dotted",
      });

    view
      .transform({
        position: [0, -0.1, 0],
      })
      .line({
        points: "#sampler",
        color: 0x3090ff,
        width: 5,
        stroke: "dashed",
      });
  });
});

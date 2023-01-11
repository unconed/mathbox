import * as MathBox from "../src";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { sleep } from "./test_utils";

describe("live properties", () => {

  const setup = () => {
    const mathbox = MathBox.mathBox({
      plugins: ["core", "controls", "cursor"],
      controls: {
        klass: OrbitControls,
      },
    });
    mathbox.three.camera.position.set(-3, 2, -2);
    mathbox.three.renderer.setClearColor(new THREE.Color(0xffffff), 1.0);

    const cartesian = mathbox.cartesian()

    cartesian.area({
      id: "sampler",
      width: 32,
      height: 32,
      axes: [1, 3],
      expr: function (emit, x, y, i, j, t) {
        emit(x, 0.25 + 0.25 * (Math.sin(Math.PI*x + t) * Math.sin(Math.PI*y)), y);
      },
    });

    return { mathbox, cartesian };
  }

  it("Updates properties when bound, but not after unbinding", async () => {
    const { cartesian } = setup();

    const p = cartesian.point({
      color: 0x3090ff,
    }, {
      size: t => 20 + t,
      opacity: t => t
    });

    await sleep(500);

    const size1 = p.get("size")
    const opacity1 = p.get("opacity")
    expect(Math.abs(size1 - 20.5)).toBeLessThan(0.2)
    expect(Math.abs(opacity1 - 0.5)).toBeLessThan(0.2)

    p.unbind("opacity")
    await sleep(500);

    const size2 = p.get("size")
    const opacity2 = p.get("opacity")
    expect(Math.abs(size2 - 21)).toBeLessThan(0.2)
    expect(opacity2).toBe(opacity1)
  });

  it("Updates live props creator via constructor, too", async () => {
    const { cartesian } = setup();

    const p = cartesian.point({
      color: 0x3090ff,
    }, {
      size: t => 20 + t,
      opacity: t => t
    })

    await sleep(500);

    const size1 = p.get("size")
    const opacity1 = p.get("opacity")
    expect(Math.abs(size1 - 20.5)).toBeLessThan(0.2)
    expect(Math.abs(opacity1 - 0.5)).toBeLessThan(0.2)
  })
});

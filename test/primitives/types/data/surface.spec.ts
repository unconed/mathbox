import * as MB from "../../../../src";
import { Color } from "three";
import { smallPause } from "../../../test_utils";

describe("surface", () => {
  describe("lineX and lineY", () => {
    const setup = (props: MB.SurfaceProps = {}) => {
      const mathbox = MB.mathBox();
      const cartesian = mathbox.cartesian();
      const area = cartesian.area({
        expr: (emit, x, y) => emit(x, x * y, y),
        items: 1,
        channels: 3,
      });
      const surface = cartesian.surface({
        points: area,
        ...props,
      });
      return { surface, mathbox };
    };

    it("only renders gridlines if lineX, lineY are true", async () => {
      const { surface } = setup();

      const controller = surface[0].controller;

      expect(controller.lineX).toBe(null);
      expect(controller.lineY).toBe(null);

      surface.set({ lineX: true });
      await smallPause();

      expect(controller.lineX).not.toBe(null);
      expect(controller.lineY).toBe(null);

      surface.set({ lineY: true });
      await smallPause();

      expect(controller.lineX).not.toBe(null);
      expect(controller.lineY).not.toBe(null);
    });

    it("darkens the gridlines iff surface is filled", async () => {
      const { surface } = setup({
        color: new Color(0.4, 0.6, 0.8).getHex(),
        fill: false,
        lineX: true,
        lineY: true,
      });
      const controller = surface[0].controller;

      const unfilledX = controller.lineX.uniforms.styleColor;
      const unfilledY = controller.lineY.uniforms.styleColor;
      expect(unfilledX.value).toEqual(new Color(0.4, 0.6, 0.8));
      expect(unfilledY.value).toEqual(new Color(0.4, 0.6, 0.8));

      surface.set({ fill: true });
      await smallPause();

      const filledX = controller.lineX.uniforms.styleColor;
      const filledY = controller.lineY.uniforms.styleColor;

      /**
       * Mostly asserting here that these values are lower (darker) than the
       * original 0.4, 0.6, 0.8
       */

      expect(filledX.value.r).toBeCloseTo(0.35, 2);
      expect(filledX.value.g).toBeCloseTo(0.52, 2);
      expect(filledX.value.b).toBeCloseTo(0.69, 2);

      expect(filledY.value.r).toBeCloseTo(0.35, 2);
      expect(filledY.value.g).toBeCloseTo(0.52, 2);
      expect(filledY.value.b).toBeCloseTo(0.69, 2);
    });
  });
});

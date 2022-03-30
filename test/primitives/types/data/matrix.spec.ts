import * as MB from "../../../../src";
import { smallPause } from "../../../test_utils";

describe("primitives.types.data.matrix", () => {
  it("reacts to changes in width, height", async () => {
    const mathbox = MB.mathBox();
    const cartesian = mathbox.cartesian();
    const matrix = cartesian.matrix({
      width: 16,
      height: 16,
    });

    const controller = matrix[0].controller;
    const rebuild = spyOn(controller, "rebuild").and.callThrough();

    expect(rebuild).toHaveBeenCalledTimes(0);
    expect(controller.space.width).toBe(16);
    expect(controller.space.height).toBe(16);

    matrix.set("width", 32);
    await smallPause();
    expect(rebuild).toHaveBeenCalledTimes(1);
    expect(controller.space.width).toBe(32);

    matrix.set("width", 24);
    await smallPause();
    expect(rebuild).toHaveBeenCalledTimes(2);
    expect(controller.space.width).toBe(24);

    matrix.set("height", 32);
    await smallPause();
    expect(rebuild).toHaveBeenCalledTimes(3);
    expect(controller.space.height).toBe(32);

    matrix.set("height", 24);
    await smallPause();
    expect(rebuild).toHaveBeenCalledTimes(4);
    expect(controller.space.height).toBe(24);
  });
});

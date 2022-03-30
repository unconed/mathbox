import * as MB from "../../../../src";
import { smallPause } from "../../../test_utils";

describe("primitives.types.data.array", () => {
  it("reacts to changes in width", async () => {
    const mathbox = MB.mathBox();
    const cartesian = mathbox.cartesian();
    const array = cartesian.array({ width: 16 });

    const controller = array[0].controller;
    const rebuild = spyOn(controller, "rebuild").and.callThrough();

    expect(rebuild).toHaveBeenCalledTimes(0);
    expect(controller.space.width).toBe(16);

    array.set("width", 32);
    await smallPause();
    expect(rebuild).toHaveBeenCalledTimes(1);
    expect(controller.space.width).toBe(32);

    array.set("width", 24);
    await smallPause();
    expect(rebuild).toHaveBeenCalledTimes(2);
    expect(controller.space.width).toBe(24);
  });
});

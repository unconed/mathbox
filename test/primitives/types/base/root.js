import * as MB from "../../../../src";

describe("primitives.types.base.root", () => {
  it("returns the root from any selection", async () => {
    const mathbox = MB.mathBox();
    const root = mathbox.cartesian().root();

    expect(root).toBe(mathbox);
  });

  it("reacts to changes in properties", async () => {
    const mathbox = MB.mathBox();
    const root = mathbox.root();

    // default focus
    expect(mathbox.get("focus")).toBe(1);

    // set via root and see the change reflected in mathbox.
    mathbox.root({ focus: 10 });
    expect(mathbox.get("focus")).toBe(10);
  });
});

import * as MathBox from "../src";

describe("remove", () => {
  it("does not throw (from issue #15)", () => {
    const mathbox = MathBox.mathBox({
      plugins: ["core", "mathbox"],
    });

    mathbox
      .cartesian({
        range: [
          [-2, 2],
          [-1, 1],
        ],
        scale: [2, 1],
      })
      .array({
        width: 4,
        expr: (emit, i) => {
          emit(i, 0);
        },
        channels: 2,
      })
      .html({
        width: 4,
        expr: (emit, el, _i) => {
          emit(el("span", { innerHTML: "hello" }));
        },
      })
      .dom({
        size: 12,
        offset: [0, 0],
        outline: 2,
        zIndex: 2,
      });

    expect(mathbox.remove("html")).toBe(mathbox);
    expect(mathbox.remove("dom")).toBe(mathbox);
  });
});

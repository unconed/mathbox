import * as MathBox from "../src";

const expectSelectionIs = (selection, selections) => {
  expect(selection.length).toBe(selections.length);
  selection.each((node, i) => {
    expect(selections[i].length).toBe(1);
    expect(node).toBe(selections[i][0]);
  });
};

describe("select", () => {
  /**
   * The goal here is not to exhaustively test the selection API, but rather
   * to sanity check that we've interfaced correctly with our qeurying library
   */

  it("runs the axis example", () => {
    const root = MathBox.mathBox();
    const [c1, c2, c3] = [
      { classes: ["child", "one"] },
      { classes: ["child", "two"] },
      { classes: ["child", "three"] },
    ].map(({ classes }) => root.group({ classes }));

    // two groups
    const gc1a = c1.group({ classes: ["grandchild", "a"] });
    const gc1b = c1.group({ classes: ["grandchild", "b"] });
    // group + area
    const gc2a = c2.group({ classes: ["grandchild", "a"], id: "group-2a" });
    const gc2b = c2.axis({ classes: ["grandchild", "b"], size: 2 });
    // group + area
    const gc3a = c3.group({ classes: ["grandchild", "a"] });
    const gc3b = c3.axis({ classes: ["grandchild", "b"], size: 3 });

    expectSelectionIs(
      root.select("group"),
      [c1, gc1a, gc1b, c2, gc2a, c3, gc3a] //
    );

    expectSelectionIs(
      root.select(".grandchild.a"),
      [gc1a, gc2a, gc3a] //
    );

    expectSelectionIs(
      root.select("root group.child axis"),
      [gc2b, gc3b] //
    );
    expectSelectionIs(
      c2.select("root group.child axis"),
      [gc2b] //
    );

    expectSelectionIs(
      c2.select("#group-2a"),
      [gc2a] //
    );
  });
});

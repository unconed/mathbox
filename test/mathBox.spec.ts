import * as MathBox from "../src";
import * as packageJson from "../package.json";
import { smallPause } from "./test_utils";

describe("MathBox.version", () => {
  it("matches package.json", () => {
    expect(packageJson.version).toBe(MathBox.version);
  });
});

describe("mathBox", () => {
  describe("ready", () => {
    it("it calls inspect asynchronously", async () => {
      const mathbox = MathBox.mathBox();
      const inspect = spyOn(mathbox, "inspect");
      expect(inspect).toHaveBeenCalledTimes(0);
      await smallPause();
      expect(inspect).toHaveBeenCalledTimes(1);
    });

    it("it does not call inspect if mathbox was destroyed", async () => {
      const mathbox = MathBox.mathBox();
      const inspect = spyOn(mathbox, "inspect");
      mathbox.three.destroy();
      expect(inspect).toHaveBeenCalledTimes(0);
      await smallPause();
      expect(inspect).toHaveBeenCalledTimes(0);
    });
  });
});

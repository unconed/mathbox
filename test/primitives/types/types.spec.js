// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as MathBox from "../../../src";
const { Types } = MathBox.Primitives.Types;

describe("primitives.types.types", function () {
  let called = 0;
  const invalid = () => (called = 1);
  const prime = () => (called = 0);
  const check = (x) => expect(called).toBe(x);

  it("validates axes", function () {
    let i, x;
    const axis = Types.axis("y");
    let value = axis.make();

    expect(value).toBe(2);

    for (i = 1; i <= 4; i++) {
      prime();
      x = axis.validate(i, value, invalid);
      check(0);
      if (x !== undefined) {
        value = x;
      }
      expect(value).toBe(i);
    }

    const map = {
      x: 1,
      y: 2,
      z: 3,
      w: 4,
      W: 1,
      H: 2,
      D: 3,
      I: 4,
      width: 1,
      height: 2,
      depth: 3,
      items: 4,
    };

    for (const key in map) {
      i = map[key];
      prime();
      x = axis.validate(key, value, invalid);
      check(0);
      if (x !== undefined) {
        value = x;
      }
      expect(value).toBe(i);
    }

    prime();
    value = 3;
    axis.validate(0, value, invalid);
    check(1);

    prime();
    value = 3;
    axis.validate(5, value, invalid);
    check(1);

    prime();
    value = 3;
    x = axis.validate("null", value, invalid);
    return check(1);
  });

  it("validates zero axes", function () {
    let i, x;
    const axis = Types.axis(3, true);
    let value = axis.make();

    expect(value).toBe(3);

    for (i = 0; i <= 4; i++) {
      prime();
      x = axis.validate(i, value, invalid);
      if (x !== undefined) {
        value = x;
      }
      expect(value).toBe(i);
      check(0);
    }

    const map = {
      x: 1,
      y: 2,
      z: 3,
      w: 4,
      W: 1,
      H: 2,
      D: 3,
      I: 4,
      zero: 0,
      null: 0,
      width: 1,
      height: 2,
      depth: 3,
      items: 4,
    };

    for (const key in map) {
      i = map[key];
      prime();
      x = axis.validate(key, value, invalid);
      if (x !== undefined) {
        value = x;
      }
      expect(value).toBe(i);
      check(0);
    }

    prime();
    value = 3;
    axis.validate(-1, value, invalid);
    check(1);

    prime();
    value = 3;
    x = axis.validate(5, value, invalid);
    return check(1);
  });

  it("validates transpose", function () {
    const transpose = Types.transpose();
    let value = transpose.make();

    expect(value).toEqual([1, 2, 3, 4]);

    prime();
    value = [1, 2, 3, 4];
    let x = transpose.validate("wxyz", value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([4, 1, 2, 3]);
    check(0);

    prime();
    value = [2, 3, 4, 1];
    x = transpose.validate("yxz", value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([2, 1, 3, 4]);
    check(0);

    prime();
    value = [3, 4, 1, 2];
    x = transpose.validate([2, 4, 1, 3], value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([2, 4, 1, 3]);
    check(0);

    prime();
    value = [4, 1, 2, 3];
    x = transpose.validate([2, 4, 1, 2], value, invalid);
    if (x !== undefined) {
      value = x;
    }
    check(1);

    prime();
    value = [1, 2, 3, 4];
    x = transpose.validate([2, 4, 1], value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([2, 4, 1, 3]);
    return check(0);
  });

  return it("validates swizzle", function () {
    const swizzle = Types.swizzle();
    let value = swizzle.make();

    expect(value).toEqual([1, 2, 3, 4]);

    prime();
    value = [1, 2, 3, 4];
    let x = swizzle.validate("wxyz", value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([4, 1, 2, 3]);
    check(0);

    prime();
    value = [2, 3, 4, 1];
    x = swizzle.validate("yxz", value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([2, 1, 3, 0]);
    check(0);

    prime();
    value = [3, 4, 1, 2];
    x = swizzle.validate([2, 4, 1, 2], value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([2, 4, 1, 2]);
    check(0);

    prime();
    value = [4, 1, 2, 3];
    x = swizzle.validate([2, 4, 1], value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([2, 4, 1, 0]);
    check(0);

    prime();
    value = [1, 2, 3, 4];
    x = swizzle.validate([7, 8, 5, 6], value, invalid);
    if (x !== undefined) {
      value = x;
    }
    return check(1);
  });
});

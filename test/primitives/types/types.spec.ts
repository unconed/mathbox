import * as MathBox from "../../../src";
import type { Axes, AxesWithZero } from "../../../src/types";
import { Color, Matrix3, Matrix4, Quaternion, Vector2, Vector3, Vector4 } from "three"

const { Types } = MathBox.Primitives.Types;

describe("primitives.types.types", function () {
  it("validates axes", () => {
    const axis = Types.axis("y");
    let value = axis.make();

    expect(value).toBe(2);

    for (const i of [1, 2, 3, 4] as const) {
      const invalid = jasmine.createSpy();
      const x = axis.validate(i, value, invalid);
      expect(invalid).not.toHaveBeenCalled();
      if (x !== undefined) {
        value = x;
      }
      expect(value).toBe(i);
    }

    const axisMap = new Map<Axes, number>([
      ["x", 1],
      ["y", 2],
      ["z", 3],
      ["w", 4],
      ["W", 1],
      ["H", 2],
      ["D", 3],
      ["I", 4],
      ["width", 1],
      ["height", 2],
      ["depth", 3],
      ["items", 4],
    ]);

    axisMap.forEach((i, key) => {
      const invalid = jasmine.createSpy();
      const x = axis.validate(key, value, invalid);
      expect(invalid).not.toHaveBeenCalled();
      if (x !== undefined) {
        value = x;
      }
      expect(value).toBe(i);
    });

    const invalid = jasmine.createSpy();
    value = 3;
    axis.validate(0 as never, value, invalid);
    expect(invalid).toHaveBeenCalledTimes(1);

    invalid.calls.reset();
    axis.validate(5 as never, value, invalid);
    expect(invalid).toHaveBeenCalledTimes(1);

    invalid.calls.reset();
    axis.validate("null" as never, value, invalid);
    expect(invalid).toHaveBeenCalledTimes(1);
  });

  it("validates zero axes", () => {
    const axis = Types.axis(3, true);
    let value = axis.make();

    expect(value).toBe(3);

    for (const i of [0, 1, 2, 3, 4] as const) {
      const invalid = jasmine.createSpy();
      const x = axis.validate(i, value, invalid);
      if (x !== undefined) {
        value = x;
      }
      expect(value).toBe(i);
      expect(invalid).not.toHaveBeenCalled();
    }

    const axisMap = new Map<AxesWithZero, number>([
      ["x", 1],
      ["y", 2],
      ["z", 3],
      ["w", 4],
      ["W", 1],
      ["H", 2],
      ["D", 3],
      ["I", 4],
      ["width", 1],
      ["height", 2],
      ["depth", 3],
      ["items", 4],
      ["zero", 0],
      ["null", 0],
    ]);

    axisMap.forEach((i, key) => {
      const invalid = jasmine.createSpy();
      const x = axis.validate(key, value, invalid);
      if (x !== undefined) {
        value = x;
      }
      expect(value).toBe(i);
      expect(invalid).not.toHaveBeenCalled();
    });

    const invalid = jasmine.createSpy();
    value = 3;
    axis.validate(-1 as never, value, invalid);
    expect(invalid).toHaveBeenCalledTimes(1);

    invalid.calls.reset();
    axis.validate(5 as never, value, invalid);
    expect(invalid).toHaveBeenCalledTimes(1);
  });

  it("validates transpose", () => {
    const transpose = Types.transpose();
    let value = transpose.make();

    expect(value).toEqual([1, 2, 3, 4]);

    const invalid = jasmine.createSpy();
    value = [1, 2, 3, 4];
    let x = transpose.validate("wxyz", value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([4, 1, 2, 3]);
    expect(invalid).not.toHaveBeenCalled();

    invalid.calls.reset();
    value = [2, 3, 4, 1];
    x = transpose.validate("yxz", value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([2, 1, 3, 4]);
    expect(invalid).not.toHaveBeenCalled();

    invalid.calls.reset();
    value = [3, 4, 1, 2];
    x = transpose.validate([2, 4, 1, 3], value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([2, 4, 1, 3]);
    expect(invalid).not.toHaveBeenCalled();

    invalid.calls.reset();
    value = [4, 1, 2, 3];
    x = transpose.validate([2, 4, 1, 2], value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(invalid).toHaveBeenCalledTimes(1);

    invalid.calls.reset();
    value = [1, 2, 3, 4];
    x = transpose.validate([2, 4, 1], value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([2, 4, 1, 3]);
    expect(invalid).not.toHaveBeenCalled();
  });

  it("validates swizzle", () => {
    const swizzle = Types.swizzle();
    let value = swizzle.make();

    expect(value).toEqual([1, 2, 3, 4]);

    const invalid = jasmine.createSpy();
    value = [1, 2, 3, 4];
    let x = swizzle.validate("wxyz", value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([4, 1, 2, 3]);
    expect(invalid).not.toHaveBeenCalled();

    invalid.calls.reset();
    value = [2, 3, 4, 1];
    x = swizzle.validate("yxz", value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([2, 1, 3, 0]);
    expect(invalid).not.toHaveBeenCalled();

    invalid.calls.reset();
    value = [3, 4, 1, 2];
    x = swizzle.validate([2, 4, 1, 2], value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([2, 4, 1, 2]);
    expect(invalid).not.toHaveBeenCalled();

    invalid.calls.reset();
    value = [4, 1, 2, 3];
    x = swizzle.validate([2, 4, 1], value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(value).toEqual([2, 4, 1, 0] as never);
    expect(invalid).not.toHaveBeenCalled();

    invalid.calls.reset();
    value = [1, 2, 3, 4];
    x = swizzle.validate([7, 8, 5, 6] as never, value, invalid);
    if (x !== undefined) {
      value = x;
    }
    expect(invalid).toHaveBeenCalledTimes(4);
  });

  it("validates color", () => {
    const color = Types.color();
    const value = color.make();
    const target = new Color()
    const onInvalid = jasmine.createSpy();

    // Default color is 0.5, 0.5, 0.5
    expect(value).toEqual(new Color(0.5, 0.5, 0.5));


    // string colors work
    expect(
      color.validate("red", target, onInvalid)
    ).toEqual(new Color(1, 0, 0));
    expect(onInvalid).not.toHaveBeenCalled();

    // ThreeJS Colors work
    expect(
      color.validate(new Color(0.1, 0.2, 0.3), target, onInvalid)
    ).toEqual(new Color(0.1, 0.2, 0.3));
    expect(onInvalid).not.toHaveBeenCalled();

    // Array colors are RGB
    expect(
      color.validate([0.3,0.4,0.5], target, onInvalid)
    ).toEqual(new Color(0.3,0.4,0.5));
    expect(onInvalid).not.toHaveBeenCalled();

    // Numbers are interpretted as hex
    expect(
      color.validate(parseInt("00FFFF", 16), target, onInvalid)
    ).toEqual(new Color(0,1,1));
    expect(onInvalid).not.toHaveBeenCalled();

    // @ts-expect-error Null is invalid; should call invalid
    color.validate(null, target, onInvalid)
    expect(onInvalid).toHaveBeenCalled();
    onInvalid.calls.reset()
  })

  it("validates vec2", () => {
    const vec2 = Types.vec2(2, 8);
    const value = vec2.make();
    const target = new Vector2()
    const onInvalid = jasmine.createSpy();

    expect(value).toEqual(new Vector2(2, 8));


    expect(
      vec2.validate(1, target, onInvalid)
    ).toEqual(new Vector2(1, 8));
    expect(onInvalid).not.toHaveBeenCalled();
    
    expect(
      vec2.validate([10, 20], target, onInvalid)
    ).toEqual(new Vector2(10, 20));
    expect(onInvalid).not.toHaveBeenCalled();

    expect(
      vec2.validate(new Vector2(30, 40), target, onInvalid)
    ).toEqual(new Vector2(30, 40));
    expect(onInvalid).not.toHaveBeenCalled();

    // @ts-expect-error Null is invalid; should call invalid
    vec2.validate(null, target, onInvalid)
    expect(onInvalid).toHaveBeenCalled();
    onInvalid.calls.reset()
  })

  it("validates vec3", () => {
    const vec3 = Types.vec3(2, 8, 16);
    const value = vec3.make();
    const target = new Vector3()
    const onInvalid = jasmine.createSpy();

    expect(value).toEqual(new Vector3(2, 8, 16));


    expect(
      vec3.validate(1, target, onInvalid)
    ).toEqual(new Vector3(1, 8, 16));
    expect(onInvalid).not.toHaveBeenCalled();
    
    expect(
      vec3.validate([10, 20, 30], target, onInvalid)
    ).toEqual(new Vector3(10, 20, 30));
    expect(onInvalid).not.toHaveBeenCalled();

    expect(
      vec3.validate(new Vector3(30, 40, 50), target, onInvalid)
    ).toEqual(new Vector3(30, 40, 50));
    expect(onInvalid).not.toHaveBeenCalled();

    // @ts-expect-error Null is invalid; should call invalid
    vec3.validate(null, target, onInvalid)
    expect(onInvalid).toHaveBeenCalled();
    onInvalid.calls.reset()
  })

  it("validates vec4", () => {
    const vec4 = Types.vec4(2, 8, 16, 32);
    const value = vec4.make();
    const target = new Vector4()
    const onInvalid = jasmine.createSpy();

    expect(value).toEqual(new Vector4(2, 8, 16, 32));


    expect(
      vec4.validate(1, target, onInvalid)
    ).toEqual(new Vector4(1, 8, 16, 32));
    expect(onInvalid).not.toHaveBeenCalled();
    
    expect(
      vec4.validate([10, 20, 30, 40], target, onInvalid)
    ).toEqual(new Vector4(10, 20, 30, 40));
    expect(onInvalid).not.toHaveBeenCalled();

    expect(
      vec4.validate(new Vector4(30, 40, 50, 60), target, onInvalid)
    ).toEqual(new Vector4(30, 40, 50, 60));
    expect(onInvalid).not.toHaveBeenCalled();

    // @ts-expect-error Null is invalid; should call invalid
    vec4.validate(null, target, onInvalid)
    expect(onInvalid).toHaveBeenCalled();
    onInvalid.calls.reset()
  })

  it("validates mat3", () => {
    const mat3 = Types.mat3(10, 20, 30);
    const value = mat3.make();
    const target = new Matrix3()
    const onInvalid = jasmine.createSpy();

    const expected1 = new Matrix3()
    expected1.set(10, 20, 30, 0, 1, 0, 0, 0, 1)
    expect(value).toEqual(expected1);


    const expected2 = new Matrix3()
    expected2.set(6,5,4,3,2,1,0,0,1)
    expect(
      mat3.validate([6, 5, 4, 3 ,2 ,1], target, onInvalid)
    ).toEqual(expected2);
    expect(onInvalid).not.toHaveBeenCalled();
    
    const input3 = new Matrix3()
    input3.set(10, 20, 30, 40, 50, 60, 70, 80, 90)
    const expected3 = new Matrix3()
    expected3.set(10, 20, 30, 40, 50, 60, 70, 80, 90)
    expect(
      mat3.validate(input3, target, onInvalid)
    ).toEqual(expected3);
    expect(onInvalid).not.toHaveBeenCalled();


    // @ts-expect-error Numbers are invalid; should call invalid
    mat3.validate(123, target, onInvalid)
    expect(onInvalid).toHaveBeenCalled();
    onInvalid.calls.reset()
  })

  it("validates mat4", () => {
    const mat4 = Types.mat4(10, 20, 30, 40);
    const value = mat4.make();
    const target = new Matrix4()
    const onInvalid = jasmine.createSpy();

    const expected1 = new Matrix4()
    expected1.set(10, 20, 30, 40, 0, 1, 0, 0, 0,0,1, 0, 0,0,0, 1)
    expect(value).toEqual(expected1);


    const expected2 = new Matrix4()
    expected2.set(8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 1, 0, 0, 0, 0, 1)
    expect(
      mat4.validate([8, 7, 6, 5, 4, 3, 2, 1], target, onInvalid)
    ).toEqual(expected2);
    expect(onInvalid).not.toHaveBeenCalled();
    
    const input3 = new Matrix4()
    input3.set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)
    const expected3 = new Matrix4()
    expected3.set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)
    expect(
      mat4.validate(input3, target, onInvalid)
    ).toEqual(expected3);
    expect(onInvalid).not.toHaveBeenCalled();


    // @ts-expect-error Numbers are invalid; should call invalid
    mat4.validate(123, target, onInvalid)
    expect(onInvalid).toHaveBeenCalled();
    onInvalid.calls.reset()
  })

  it("validates quaternions", () => {
    const quat = Types.quat(2, 8, 16);
    const value = quat.make();
    const target = new Quaternion()
    const onInvalid = jasmine.createSpy();


    /**
     * This seems like a bug. `Types.quat(...)` accepts default values for xyzw,
     * but the defaults are usually not used. (They are when passing an array,
     * but not when passing a Vector4 instance).
     * 
     * In pratice this probably doesn't really matter, since Mathbox doesn't
     * actually use the quat(...) parameters for any of its quaternion properties.
     */
    expect(value).toEqual(new Quaternion(0, 0, 0, 1));


    expect(
      quat.validate(10, target, onInvalid)
    ).toEqual(new Quaternion(10, 8, 16, 1).normalize());
    expect(onInvalid).not.toHaveBeenCalled();
    
    expect(
      quat.validate([10, 20 ], target, onInvalid)
    ).toEqual(new Quaternion(10, 20, 16, 1).normalize());
    expect(onInvalid).not.toHaveBeenCalled();

    expect(
      quat.validate(new Vector4(10, 20), target, onInvalid)
    ).toEqual(new Quaternion(10, 20, 0, 1).normalize());
    expect(onInvalid).not.toHaveBeenCalled();

    expect(
      quat.validate(new Quaternion(30, 40, 50, 60), target, onInvalid)
    ).toEqual(new Quaternion(30, 40, 50, 60).normalize());
    expect(onInvalid).not.toHaveBeenCalled();
  })
});
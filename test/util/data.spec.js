// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as MathBox from "../../src";
const { Data } = MathBox.Util;

describe("util.data", function () {
  it("passed through null array dimensions", function () {
    const spec = Data.getDimensions(null, {
      items: 2,
      channels: 3,
      width: 5,
      height: 7,
      depth: 11,
    });
    return expect(spec).toEqual({
      items: 2,
      channels: 3,
      width: 5,
      height: 7,
      depth: 11,
    });
  });

  it("parses 1D JS array dimensions", function () {
    let spec = Data.getDimensions([1, 2, 3], { items: 1, channels: 1 });
    expect(spec).toEqual({
      items: 1,
      channels: 1,
      width: 3,
      height: 1,
      depth: 1,
    });

    spec = Data.getDimensions(__range__(1, 2 * 3, true), {
      items: 1,
      channels: 2,
    });
    expect(spec).toEqual({
      items: 1,
      channels: 2,
      width: 3,
      height: 1,
      depth: 1,
    });

    spec = Data.getDimensions(__range__(1, 2 * 3, true), {
      items: 2,
      channels: 1,
    });
    expect(spec).toEqual({
      items: 2,
      channels: 1,
      width: 3,
      height: 1,
      depth: 1,
    });

    spec = Data.getDimensions(__range__(1, 2 * 3 * 5, true), {
      items: 2,
      channels: 3,
    });
    expect(spec).toEqual({
      items: 2,
      channels: 3,
      width: 5,
      height: 1,
      depth: 1,
    });

    spec = Data.getDimensions(__range__(1, 2 * 3 * 5, true), {
      items: 2,
      channels: 3,
      width: 1,
    });
    expect(spec).toEqual({
      items: 2,
      channels: 3,
      width: 1,
      height: 5,
      depth: 1,
    });

    spec = Data.getDimensions(__range__(1, 2 * 3 * 5, true), {
      items: 2,
      channels: 3,
      width: 1,
      height: 1,
    });
    expect(spec).toEqual({
      items: 2,
      channels: 3,
      width: 1,
      height: 1,
      depth: 5,
    });

    spec = Data.getDimensions(__range__(1, 2 * 3 * 5 * 7, true), {
      items: 2,
      channels: 3,
      width: 5,
    });
    expect(spec).toEqual({
      items: 2,
      channels: 3,
      width: 5,
      height: 7,
      depth: 1,
    });

    spec = Data.getDimensions(__range__(1, 2 * 3 * 5 * 7, true), {
      items: 2,
      channels: 3,
      width: 5,
      height: 1,
    });
    expect(spec).toEqual({
      items: 2,
      channels: 3,
      width: 5,
      height: 1,
      depth: 7,
    });

    spec = Data.getDimensions(__range__(1, 2 * 3 * 5 * 7 * 11, true), {
      items: 2,
      channels: 3,
      width: 5,
      height: 7,
    });
    expect(spec).toEqual({
      items: 2,
      channels: 3,
      width: 5,
      height: 7,
      depth: 11,
    });

    spec = Data.getDimensions(__range__(1, 2 * 3 * 5 * 7 * 11, true), {
      items: 2,
      channels: 3,
      width: 5,
      depth: 1,
    });
    return expect(spec).toEqual({
      items: 2,
      channels: 3,
      width: 5,
      height: 7 * 11,
      depth: 1,
    });
  });

  it("parses 2D JS array dimensions", function () {
    const map = (channels) => (x) => __range__(1, channels, true);

    let spec = Data.getDimensions([1, 2, 3].map(map(2)), {
      items: 1,
      channels: 1,
    });
    expect(spec).toEqual({
      items: 1,
      channels: 1,
      width: 2,
      height: 3,
      depth: 1,
    });

    spec = Data.getDimensions([1, 2, 3].map(map(2)), {
      items: 1,
      channels: 1,
      width: 1,
    });
    expect(spec).toEqual({
      items: 1,
      channels: 1,
      width: 1,
      height: 2,
      depth: 3,
    });

    spec = Data.getDimensions([1, 2, 3].map(map(2)), {
      items: 1,
      channels: 1,
      height: 1,
    });
    expect(spec).toEqual({
      items: 1,
      channels: 1,
      width: 2,
      height: 1,
      depth: 3,
    });

    spec = Data.getDimensions([1, 2, 3].map(map(2)), { items: 1, channels: 2 });
    expect(spec).toEqual({
      items: 1,
      channels: 2,
      width: 3,
      height: 1,
      depth: 1,
    });

    spec = Data.getDimensions([1, 2, 3].map(map(2)), { items: 2, channels: 1 });
    expect(spec).toEqual({
      items: 2,
      channels: 1,
      width: 3,
      height: 1,
      depth: 1,
    });

    spec = Data.getDimensions(__range__(1, 3 * 5, true).map(map(2)), {
      items: 3,
      channels: 2,
    });
    expect(spec).toEqual({
      items: 3,
      channels: 2,
      width: 5,
      height: 1,
      depth: 1,
    });

    spec = Data.getDimensions(__range__(1, 3 * 5, true).map(map(2)), {
      items: 3,
      channels: 2,
      width: 1,
    });
    expect(spec).toEqual({
      items: 3,
      channels: 2,
      width: 1,
      height: 5,
      depth: 1,
    });

    spec = Data.getDimensions(__range__(1, 3 * 5, true).map(map(2)), {
      items: 3,
      channels: 2,
      width: 1,
      height: 1,
    });
    expect(spec).toEqual({
      items: 3,
      channels: 2,
      width: 1,
      height: 1,
      depth: 5,
    });

    spec = Data.getDimensions(__range__(1, 3 * 5, true).map(map(2)), {
      items: 2,
      channels: 1,
      width: 3,
    });
    expect(spec).toEqual({
      items: 2,
      channels: 1,
      width: 3,
      height: 5,
      depth: 1,
    });

    spec = Data.getDimensions(__range__(1, 3 * 5, true).map(map(2)), {
      items: 2,
      channels: 1,
      width: 3,
      height: 1,
    });
    expect(spec).toEqual({
      items: 2,
      channels: 1,
      width: 3,
      height: 1,
      depth: 5,
    });

    spec = Data.getDimensions(__range__(1, 3 * 5, true).map(map(2)), {
      items: 2,
      channels: 1,
      width: 1,
      height: 3,
    });
    expect(spec).toEqual({
      items: 2,
      channels: 1,
      width: 1,
      height: 3,
      depth: 5,
    });

    spec = Data.getDimensions(__range__(1, 3 * 5, true).map(map(2)), {
      items: 2,
      channels: 1,
      width: 1,
      depth: 1,
    });
    return expect(spec).toEqual({
      items: 2,
      channels: 1,
      width: 1,
      height: 3 * 5,
      depth: 1,
    });
  });

  it("parses 3D JS array dimensions", function () {
    const map = (channels) => (x) => __range__(1, channels, true);
    const nest = (f, g) => (x) => f(x).map(g);

    let spec = Data.getDimensions([1, 2, 3, 4, 5].map(nest(map(3), map(2))), {
      items: 1,
      channels: 1,
    });

    expect(spec).toEqual({
      items: 1,
      channels: 1,
      width: 2,
      height: 3,
      depth: 5,
    });

    spec = Data.getDimensions([1, 2, 3, 4, 5].map(nest(map(3), map(2))), {
      items: 1,
      channels: 2,
    });

    expect(spec).toEqual({
      items: 1,
      channels: 2,
      width: 3,
      height: 5,
      depth: 1,
    });

    spec = Data.getDimensions([1, 2, 3, 4, 5].map(nest(map(3), map(2))), {
      items: 2,
      channels: 1,
    });

    expect(spec).toEqual({
      items: 2,
      channels: 1,
      width: 3,
      height: 5,
      depth: 1,
    });

    spec = Data.getDimensions([1, 2, 3, 4, 5].map(nest(map(3), map(2))), {
      items: 3,
      channels: 2,
    });

    expect(spec).toEqual({
      items: 3,
      channels: 2,
      width: 5,
      height: 1,
      depth: 1,
    });

    spec = Data.getDimensions(
      __range__(1, 5 * 7, true).map(nest(map(3), map(2))),
      { items: 3, channels: 2, width: 5 }
    );

    expect(spec).toEqual({
      items: 3,
      channels: 2,
      width: 5,
      height: 7,
      depth: 1,
    });

    spec = Data.getDimensions(
      __range__(1, 5 * 7, true).map(nest(map(3), map(2))),
      { items: 3, channels: 2, width: 1, height: 7 }
    );

    expect(spec).toEqual({
      items: 3,
      channels: 2,
      width: 1,
      height: 7,
      depth: 5,
    });

    spec = Data.getDimensions(
      __range__(1, 5 * 7, true).map(nest(map(3), map(2))),
      { items: 3, channels: 2, height: 1, width: 5 }
    );

    expect(spec).toEqual({
      items: 3,
      channels: 2,
      width: 5,
      height: 1,
      depth: 7,
    });

    spec = Data.getDimensions(
      __range__(1, 5 * 7, true).map(nest(map(3), map(2))),
      { items: 3, channels: 2, height: 1, depth: 1 }
    );

    return expect(spec).toEqual({
      items: 3,
      channels: 2,
      width: 5 * 7,
      height: 1,
      depth: 1,
    });
  });

  it("thunks a 1D array", function () {
    const data = [1, 2, 3, 4, 5, 6];
    const thunk = Data.getThunk(data);
    const n = 6;

    let last = null;
    for (
      let i = 1, end = n, asc = 1 <= end;
      asc ? i <= end : i >= end;
      asc ? i++ : i--
    ) {
      const value = thunk();
      expect(value).toBeGreaterThan(0);
      if (last != null) {
        expect(value).toBeGreaterThan(last);
      }
      last = value;
    }
    return expect(thunk()).toBeFalsy();
  });

  it("thunks a 2D array", function () {
    let index = 1;
    const map = (channels) => (x) =>
      __range__(index, (index += channels), false);
    const nest = (f, g) => (x) => f(x).map(g);

    const data = [1, 2, 3].map(map(2));
    const thunk = Data.getThunk(data);
    const n = 2 * 3;

    let last = null;
    for (
      let i = 1, end = n, asc = 1 <= end;
      asc ? i <= end : i >= end;
      asc ? i++ : i--
    ) {
      const value = thunk();
      expect(value).toBeGreaterThan(0);
      if (last != null) {
        expect(value).toBeGreaterThan(last);
      }
      last = value;
    }
    return expect(thunk()).toBeFalsy();
  });

  it("thunks a 3D array", function () {
    let index = 1;
    const map = (channels) => (x) =>
      __range__(index, (index += channels), false);
    const nest = (f, g) => (x) => f(x).map(g);

    const data = [1, 2, 3, 4, 5].map(nest(map(3), map(2)));
    const thunk = Data.getThunk(data);
    const n = 2 * 3 * 5;

    let last = null;
    for (
      let i = 1, end = n, asc = 1 <= end;
      asc ? i <= end : i >= end;
      asc ? i++ : i--
    ) {
      const value = thunk();
      expect(value).toBeGreaterThan(0);
      if (last != null) {
        expect(value).toBeGreaterThan(last);
      }
      last = value;
    }
    return expect(thunk()).toBeFalsy();
  });

  it("thunks a 4D array", function () {
    let index = 1;
    const map = (channels) => (x) =>
      __range__(index, (index += channels), false);
    const nest = (f, g) => (x) => f(x).map(g);

    const data = [1, 2, 3, 4, 5, 6, 7].map(nest(map(5), nest(map(3), map(2))));
    const thunk = Data.getThunk(data);
    const n = 2 * 3 * 5 * 7;

    let last = null;
    for (
      let i = 1, end = n, asc = 1 <= end;
      asc ? i <= end : i >= end;
      asc ? i++ : i--
    ) {
      const value = thunk();
      expect(value).toBeGreaterThan(0);
      if (last != null) {
        expect(value).toBeGreaterThan(last);
      }
      last = value;
    }
    return expect(thunk()).toBeFalsy();
  });

  it("thunks a 5D array", function () {
    let index = 1;
    const map = (channels) => (x) =>
      __range__(index, (index += channels), false);
    const nest = (f, g) => (x) => f(x).map(g);

    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
      nest(map(7), nest(map(5), nest(map(3), map(2))))
    );
    const thunk = Data.getThunk(data);
    const n = 2 * 3 * 5 * 7 * 11;

    let last = null;
    for (
      let i = 1, end = n, asc = 1 <= end;
      asc ? i <= end : i >= end;
      asc ? i++ : i--
    ) {
      const value = thunk();
      expect(value).toBeGreaterThan(0);
      if (last != null) {
        expect(value).toBeGreaterThan(last);
      }
      last = value;
    }
    return expect(thunk()).toBeFalsy();
  });

  it("makes a 1 item, 1 channel emitter", function () {
    let j;
    let i = (j = 0);
    const n = 1;
    const thunk = () => i++;
    const out = [];

    Data.makeEmitter(thunk, 1, 1)((x) => out.push(x));

    expect(i).toBe(n);
    expect(out.length).toBe(n);
    return Array.from(out).map((v) => expect(v).toBe(j++));
  });

  it("makes a 2 item, 4 channel emitter", function () {
    let j, row;
    const items = 2;
    const channels = 4;

    let i = (j = 0);
    const n = items * channels;
    const thunk = () => i++;
    const out = [];

    Data.makeEmitter(
      thunk,
      items,
      channels
    )((x, y, z, w) => out.push([x, y, z, w]));

    expect(i).toBe(n);
    expect(out.length).toBe(items);
    for (row of Array.from(out)) {
      expect(row.length).toBe(channels);
    }
    return (() => {
      const result = [];
      for (row of Array.from(out)) {
        result.push(Array.from(row).map((v) => expect(v).toBe(j++)));
      }
      return result;
    })();
  });

  return it("makes a 14 item, 3 channel emitter", function () {
    let j, row;
    const items = 14;
    const channels = 3;

    let i = (j = 0);
    const n = items * channels;
    const thunk = () => i++;
    const out = [];

    Data.makeEmitter(thunk, items, channels)((x, y, z) => out.push([x, y, z]));

    expect(i).toBe(n);
    expect(out.length).toBe(items);
    for (row of Array.from(out)) {
      expect(row.length).toBe(channels);
    }
    return (() => {
      const result = [];
      for (row of Array.from(out)) {
        result.push(Array.from(row).map((v) => expect(v).toBe(j++)));
      }
      return result;
    })();
  });
});

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}

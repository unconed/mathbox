Data = MathBox.Util.Data

describe "util.data", () ->

  it 'passed through null array dimensions', () ->
    spec = Data.getDimensions null,
      items: 2
      channels: 3
      width: 5
      height: 7
      depth: 11
    expect(spec).toEqual
      items:    2
      channels: 3
      width:    5
      height:   7
      depth:    11

  it 'parses 1D JS array dimensions', () ->

    spec = Data.getDimensions [1..3],
      items: 1, channels: 1
    expect(spec).toEqual
      items:    1
      channels: 1
      width:    3
      height:   1
      depth:    1

    spec = Data.getDimensions [1..(2*3)],
      items: 1, channels: 2
    expect(spec).toEqual
      items:    1
      channels: 2
      width:    3
      height:   1
      depth:    1

    spec = Data.getDimensions [1..(2*3)],
      items: 2, channels: 1
    expect(spec).toEqual
      items:    2
      channels: 1
      width:    3
      height:   1
      depth:    1

    spec = Data.getDimensions [1..(2*3*5)],
      items: 2, channels: 3
    expect(spec).toEqual
      items:    2
      channels: 3
      width:    5
      height:   1
      depth:    1

    spec = Data.getDimensions [1..(2*3*5)],
      items: 2, channels: 3, width: 1
    expect(spec).toEqual
      items:    2
      channels: 3
      width:    1
      height:   5
      depth:    1

    spec = Data.getDimensions [1..(2*3*5)],
      items: 2, channels: 3, width: 1, height: 1
    expect(spec).toEqual
      items:    2
      channels: 3
      width:    1
      height:   1
      depth:    5

    spec = Data.getDimensions [1..(2*3*5*7)],
      items: 2, channels: 3, width: 5
    expect(spec).toEqual
      items:    2
      channels: 3
      width:    5
      height:   7
      depth:    1

    spec = Data.getDimensions [1..(2*3*5*7)],
      items: 2, channels: 3, width: 5, height: 1
    expect(spec).toEqual
      items:    2
      channels: 3
      width:    5
      height:   1
      depth:    7

    spec = Data.getDimensions [1..(2*3*5*7*11)],
      items: 2, channels: 3, width: 5, height: 7
    expect(spec).toEqual
      items:    2
      channels: 3
      width:    5
      height:   7
      depth:    11

    spec = Data.getDimensions [1..(2*3*5*7*11)],
      items: 2, channels: 3, width: 5, depth: 1
    expect(spec).toEqual
      items:    2
      channels: 3
      width:    5
      height:   7*11
      depth:    1

  it 'parses 2D JS array dimensions', () ->

    map = (channels) -> (x) -> [1..channels]

    spec = Data.getDimensions [1..3].map(map(2)),
      items: 1, channels: 1
    expect(spec).toEqual
      items:    1
      channels: 1
      width:    2
      height:   3
      depth:    1

    spec = Data.getDimensions [1..3].map(map(2)),
      items: 1, channels: 1, width: 1
    expect(spec).toEqual
      items:    1
      channels: 1
      width:    1
      height:   2
      depth:    3

    spec = Data.getDimensions [1..3].map(map(2)),
      items: 1, channels: 1, height: 1
    expect(spec).toEqual
      items:    1
      channels: 1
      width:    2
      height:   1
      depth:    3

    spec = Data.getDimensions [1..3].map(map(2)),
      items: 1, channels: 2
    expect(spec).toEqual
      items:    1
      channels: 2
      width:    3
      height:   1
      depth:    1

    spec = Data.getDimensions [1..3].map(map(2)),
      items: 2, channels: 1
    expect(spec).toEqual
      items:    2
      channels: 1
      width:    3
      height:   1
      depth:    1

    spec = Data.getDimensions [1..(3*5)].map(map(2)),
      items: 3, channels: 2
    expect(spec).toEqual
      items:    3
      channels: 2
      width:    5
      height:   1
      depth:    1

    spec = Data.getDimensions [1..(3*5)].map(map(2)),
      items: 3, channels: 2, width: 1
    expect(spec).toEqual
      items:    3
      channels: 2
      width:    1
      height:   5
      depth:    1

    spec = Data.getDimensions [1..(3*5)].map(map(2)),
      items: 3, channels: 2, width: 1, height: 1
    expect(spec).toEqual
      items:    3
      channels: 2
      width:    1
      height:   1
      depth:    5

    spec = Data.getDimensions [1..(3*5)].map(map(2)),
      items: 2, channels: 1, width: 3
    expect(spec).toEqual
      items:    2
      channels: 1
      width:    3
      height:   5
      depth:    1

    spec = Data.getDimensions [1..(3*5)].map(map(2)),
      items: 2, channels: 1, width: 3, height: 1
    expect(spec).toEqual
      items:    2
      channels: 1
      width:    3
      height:   1
      depth:    5

    spec = Data.getDimensions [1..(3*5)].map(map(2)),
      items: 2, channels: 1, width: 1, height: 3
    expect(spec).toEqual
      items:    2
      channels: 1
      width:    1
      height:   3
      depth:    5

    spec = Data.getDimensions [1..(3*5)].map(map(2)),
      items: 2, channels: 1, width: 1, depth: 1
    expect(spec).toEqual
      items:    2
      channels: 1
      width:    1
      height:   3*5
      depth:    1

  it 'parses 3D JS array dimensions', () ->

    map = (channels) -> (x) -> [1..channels]
    nest = (f, g) -> (x) -> f(x).map(g)

    spec = Data.getDimensions [1..5].map(nest(map(3), map(2))),
      items: 1, channels: 1

    expect(spec).toEqual
      items:    1
      channels: 1
      width:    2
      height:   3
      depth:    5

    spec = Data.getDimensions [1..5].map(nest(map(3), map(2))),
      items: 1, channels: 2

    expect(spec).toEqual
      items:    1
      channels: 2
      width:    3
      height:   5
      depth:    1

    spec = Data.getDimensions [1..5].map(nest(map(3), map(2))),
      items: 2, channels: 1

    expect(spec).toEqual
      items:    2
      channels: 1
      width:    3
      height:   5
      depth:    1

    spec = Data.getDimensions [1..5].map(nest(map(3), map(2))),
      items: 3, channels: 2

    expect(spec).toEqual
      items:    3
      channels: 2
      width:    5
      height:   1
      depth:    1

    spec = Data.getDimensions [1..(5*7)].map(nest(map(3), map(2))),
      items: 3, channels: 2, width: 5

    expect(spec).toEqual
      items:    3
      channels: 2
      width:    5
      height:   7
      depth:    1

    spec = Data.getDimensions [1..(5*7)].map(nest(map(3), map(2))),
      items: 3, channels: 2, width: 1, height: 7

    expect(spec).toEqual
      items:    3
      channels: 2
      width:    1
      height:   7
      depth:    5

    spec = Data.getDimensions [1..(5*7)].map(nest(map(3), map(2))),
      items: 3, channels: 2, height: 1, width: 5

    expect(spec).toEqual
      items:    3
      channels: 2
      width:    5
      height:   1
      depth:    7

    spec = Data.getDimensions [1..(5*7)].map(nest(map(3), map(2))),
      items: 3, channels: 2, height: 1, depth: 1

    expect(spec).toEqual
      items:    3
      channels: 2
      width:    5*7
      height:   1
      depth:    1

  it 'thunks a 1D array', () ->

    data = [1..6]
    thunk = Data.getThunk data
    n = 6

    last = null
    for i in [1..n]
      value = thunk()
      expect(value).toBeGreaterThan(0)
      expect(value).toBeGreaterThan(last) if last?
      last = value
    expect(thunk()).toBeFalsy()

  it 'thunks a 2D array', () ->

    index = 1
    map = (channels) -> (x) -> [index...(index += channels)]
    nest = (f, g) -> (x) -> f(x).map(g)

    data = [1..3].map(map(2))
    thunk = Data.getThunk data
    n = 2 * 3

    last = null
    for i in [1..n]
      value = thunk()
      expect(value).toBeGreaterThan(0)
      expect(value).toBeGreaterThan(last) if last?
      last = value
    expect(thunk()).toBeFalsy()

  it 'thunks a 3D array', () ->

    index = 1
    map = (channels) -> (x) -> [index...(index += channels)]
    nest = (f, g) -> (x) -> f(x).map(g)

    data = [1..5].map(nest(map(3), map(2)))
    thunk = Data.getThunk data
    n = 2 * 3 * 5

    last = null
    for i in [1..n]
      value = thunk()
      expect(value).toBeGreaterThan(0)
      expect(value).toBeGreaterThan(last) if last?
      last = value
    expect(thunk()).toBeFalsy()

  it 'thunks a 4D array', () ->

    index = 1
    map = (channels) -> (x) -> [index...(index += channels)]
    nest = (f, g) -> (x) -> f(x).map(g)

    data = [1..7].map(nest(map(5), nest(map(3), map(2))))
    thunk = Data.getThunk data
    n = 2 * 3 * 5 * 7

    last = null
    for i in [1..n]
      value = thunk()
      expect(value).toBeGreaterThan(0)
      expect(value).toBeGreaterThan(last) if last?
      last = value
    expect(thunk()).toBeFalsy()

  it 'thunks a 5D array', () ->

    index = 1
    map = (channels) -> (x) -> [index...(index += channels)]
    nest = (f, g) -> (x) -> f(x).map(g)

    data = [1..11].map(nest(map(7), nest(map(5), nest(map(3), map(2)))))
    thunk = Data.getThunk data
    n = 2 * 3 * 5 * 7 * 11

    last = null
    for i in [1..n]
      value = thunk()
      expect(value).toBeGreaterThan(0)
      expect(value).toBeGreaterThan(last) if last?
      last = value
    expect(thunk()).toBeFalsy()

  it 'makes a 1 item, 1 channel emitter', () ->

    i = j = 0
    n = 1
    thunk = () -> i++
    out = []

    Data.makeEmitter(thunk, 1, 1)((x) -> out.push(x))

    expect(i).toBe n
    expect(out.length).toBe n
    expect(v).toBe(j++) for v in out

  it 'makes a 2 item, 4 channel emitter', () ->

    items    = 2
    channels = 4

    i = j = 0
    n = items * channels
    thunk = () -> i++
    out = []

    Data.makeEmitter(thunk, items, channels)((x, y, z, w) -> out.push([x, y, z, w]))

    expect(i).toBe n
    expect(out.length).toBe items
    expect(row.length).toBe channels for row in out
    expect(v).toBe(j++) for v in row for row in out

  it 'makes a 14 item, 3 channel emitter', () ->

    items    = 14
    channels = 3

    i = j = 0
    n = items * channels
    thunk = () -> i++
    out = []

    Data.makeEmitter(thunk, items, channels)((x, y, z) -> out.push([x, y, z]))

    expect(i).toBe n
    expect(out.length).toBe items
    expect(row.length).toBe channels for row in out
    expect(v).toBe(j++) for v in row for row in out

Types = MathBox.Primitives.Types.Types

describe "primitives.types.types", () ->

  called = 0
  invalid = () -> called = 1
  prime = () -> called = 0
  check = (x) -> expect(called).toBe(x)

  it 'validates axes', () ->

    axis = Types.axis('y')
    value = axis.make()

    expect(value).toBe(2)

    for i in [1..4]
      prime()
      x = axis.validate i, value, invalid
      check(0)
      value = x if x != undefined
      expect(value).toBe(i)

    map =
      x: 1
      y: 2
      z: 3
      w: 4
      W: 1
      H: 2
      D: 3
      I: 4
      width:  1
      height: 2
      depth:  3
      items:  4

    for key, i of map
      prime()
      x = axis.validate key, value, invalid
      check(0)
      value = x if x != undefined
      expect(value).toBe(i)

    prime()
    value = 3
    axis.validate 0, value, invalid
    check(1)

    prime()
    value = 3
    axis.validate 5, value, invalid
    check(1)

    prime()
    value = 3
    x = axis.validate 'null', value, invalid
    check(1)

  it 'validates zero axes', () ->

    axis = Types.axis(3, true)
    value = axis.make()

    expect(value).toBe(3)

    for i in [0..4]
      prime()
      x = axis.validate i, value, invalid
      value = x if x != undefined
      expect(value).toBe(i)
      check(0)

    map =
      x: 1
      y: 2
      z: 3
      w: 4
      W: 1
      H: 2
      D: 3
      I: 4
      zero:   0
      null:   0
      width:  1
      height: 2
      depth:  3
      items:  4

    for key, i of map
      prime()
      x = axis.validate key, value, invalid
      value = x if x != undefined
      expect(value).toBe(i)
      check(0)

    prime()
    value = 3
    axis.validate -1, value, invalid
    check(1)

    prime()
    value = 3
    x = axis.validate 5, value, invalid
    check(1)

  it 'validates transpose', () ->

    transpose = Types.transpose()
    value = transpose.make()

    expect(value).toEqual([1, 2, 3, 4])

    prime()
    value = [1, 2, 3, 4]
    x = transpose.validate 'wxyz', value, invalid
    value = x if x != undefined
    expect(value).toEqual([4, 1, 2, 3])
    check(0)

    prime()
    value = [2, 3, 4, 1]
    x = transpose.validate 'yxz', value, invalid
    value = x if x != undefined
    expect(value).toEqual([2, 1, 3, 4])
    check(0)

    prime()
    value = [3, 4, 1, 2]
    x = transpose.validate [2, 4, 1, 3], value, invalid
    value = x if x != undefined
    expect(value).toEqual([2, 4, 1, 3])
    check(0)

    prime()
    value = [4, 1, 2, 3]
    x = transpose.validate [2, 4, 1, 2], value, invalid
    value = x if x != undefined
    check(1)

    prime()
    value = [1, 2, 3, 4]
    x = transpose.validate [2, 4, 1], value, invalid
    value = x if x != undefined
    expect(value).toEqual([2, 4, 1, 3])
    check(0)

  it 'validates swizzle', () ->

    swizzle = Types.swizzle()
    value = swizzle.make()

    expect(value).toEqual([1, 2, 3, 4])

    prime()
    value = [1, 2, 3, 4]
    x = swizzle.validate 'wxyz', value, invalid
    value = x if x != undefined
    expect(value).toEqual([4, 1, 2, 3])
    check(0)

    prime()
    value = [2, 3, 4, 1]
    x = swizzle.validate 'yxz', value, invalid
    value = x if x != undefined
    expect(value).toEqual([2, 1, 3, 0])
    check(0)

    prime()
    value = [3, 4, 1, 2]
    x = swizzle.validate [2, 4, 1, 2], value, invalid
    value = x if x != undefined
    expect(value).toEqual([2, 4, 1, 2])
    check(0)

    prime()
    value = [4, 1, 2, 3]
    x = swizzle.validate [2, 4, 1], value, invalid
    value = x if x != undefined
    expect(value).toEqual([2, 4, 1, 0])
    check(0)

    prime()
    value = [1, 2, 3, 4]
    x = swizzle.validate [7, 8, 5, 6], value, invalid
    value = x if x != undefined
    check(1)

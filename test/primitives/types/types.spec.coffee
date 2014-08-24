Types = MathBox.Primitives.Types.Types

describe "primitives.types.types", () ->

  it 'validates axes', () ->

    axis = Types.axis('y')
    value = axis.make()

    expect(value).toBe(2)

    for i in [1..4]
      x = axis.validate i, value
      value = x if x != undefined
      expect(value).toBe(i)

    map =
      x: 1
      y: 2
      z: 3
      w: 4
      i: 4
      width:  1
      height: 2
      depth:  3
      items:  4

    for key, i of map
      x = axis.validate key, value
      value = x if x != undefined
      expect(value).toBe(i)

    value = 3
    x = axis.validate 0, value
    value = x if x != undefined
    expect(value).toBe(3)

    value = 3
    x = axis.validate 5, value
    value = x if x != undefined
    expect(value).toBe(3)

    value = 3
    x = axis.validate 'null', value
    value = x if x != undefined
    expect(value).toBe(3)

  it 'validates zero axes', () ->

    axis = Types.axis(3, true)
    value = axis.make()

    expect(value).toBe(3)

    for i in [0..4]
      x = axis.validate i, value
      value = x if x != undefined
      expect(value).toBe(i)

    map =
      x: 1
      y: 2
      z: 3
      w: 4
      i: 4
      null:   0
      width:  1
      height: 2
      depth:  3
      items:  4

    for key, i of map
      x = axis.validate key, value
      value = x if x != undefined
      expect(value).toBe(i)

    value = 3
    x = axis.validate -1, value
    value = x if x != undefined
    expect(value).toBe(3)

    value = 3
    x = axis.validate 5, value
    value = x if x != undefined
    expect(value).toBe(3)

  it 'validates transpose', () ->

    transpose = Types.transpose()
    value = transpose.make()

    expect(value).toEqual([1, 2, 3, 4])

    value = [1, 2, 3, 4]
    x = transpose.validate 'wxyz', value
    value = x if x != undefined
    expect(value).toEqual([4, 1, 2, 3])

    value = [2, 3, 4, 1]
    x = transpose.validate 'yxz', value
    value = x if x != undefined
    expect(value).toEqual([2, 1, 3, 4])

    value = [3, 4, 1, 2]
    x = transpose.validate [2, 4, 1, 3], value
    value = x if x != undefined
    expect(value).toEqual([2, 4, 1, 3])

    value = [4, 1, 2, 3]
    x = transpose.validate [2, 4, 1, 2], value
    value = x if x != undefined
    expect(value).toEqual([4, 1, 2, 3])

    value = [1, 2, 3, 4]
    x = transpose.validate [2, 4, 1], value
    value = x if x != undefined
    expect(value).toEqual([2, 4, 1, 3])

  it 'validates swizzle', () ->

    swizzle = Types.swizzle()
    value = swizzle.make()

    expect(value).toEqual([1, 2, 3, 4])

    value = [1, 2, 3, 4]
    x = swizzle.validate 'wxyz', value
    value = x if x != undefined
    expect(value).toEqual([4, 1, 2, 3])

    value = [2, 3, 4, 1]
    x = swizzle.validate 'yxz', value
    value = x if x != undefined
    expect(value).toEqual([2, 1, 3, 0])

    value = [3, 4, 1, 2]
    x = swizzle.validate [2, 4, 1, 2], value
    value = x if x != undefined
    expect(value).toEqual([2, 4, 1, 2])

    value = [4, 1, 2, 3]
    x = swizzle.validate [2, 4, 1], value
    value = x if x != undefined
    expect(value).toEqual([2, 4, 1, 0])

    value = [1, 2, 3, 4]
    x = swizzle.validate [7, 8, 5, 6], value
    value = x if x != undefined
    expect(value).toEqual([1, 2, 3, 4])

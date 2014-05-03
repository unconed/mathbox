class Geometry extends THREE.BufferGeometry
  constructor: () ->
    THREE.BufferGeometry.call @
#    @dynamic = false

  _reduce: (dims, maxs) ->
    broken = false
    for dim, i in dims
      max = maxs[i]
      if broken
        dims[i] = max
      else if dim < max
        broken = true

    quads = dims.reduce (a, b) -> a * b

  _emitter: (name) ->
    attribute = @attributes[name]
    dimensions = attribute.itemSize
    array = attribute.array
    offset = 0

    if name != 'index'
      numItems = attribute.array.length / attribute.itemSize
      if numItems > 65536
        throw "Index out of bounds. Cannot exceed 65536 indexed vertices."

    one = (a) ->
      array[offset++] = a
    two = (a, b) ->
      array[offset++] = a
      array[offset++] = b
    three = (a, b, c) ->
      array[offset++] = a
      array[offset++] = b
      array[offset++] = c
    four = (a, b, c, d) ->
      array[offset++] = a
      array[offset++] = b
      array[offset++] = c
      array[offset++] = d

    [null, one, two, three, four][dimensions]

module.exports = Geometry
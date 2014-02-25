class Geometry extends THREE.BufferGeometry
  constructor: () ->
    THREE.BufferGeometry.call @

  _emitter: (name) ->
    attribute = @attributes[name]
    array = attribute.array

    n = attribute.itemSize
    offset = 0

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

    [null, one, two, three, four][itemSize]

module.exports = Geometry
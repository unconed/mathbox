_Array = require './array'
Util = require '../../../util'

class Interval extends _Array
  @traits = ['node', 'buffer', 'data', 'source', 'index', 'texture', 'array', 'span', 'interval', 'sampler', 'raw']

  callback: (callback) ->
    dimension = @props.axis
    length    = @props.length
    centered  = @props.centered

    range     = @_helpers.span.get '', dimension

    a = range.x
    span = range.y - range.x

    if centered
      inverse   = 1 / Math.max 1, length
      a += span * inverse / 2
    else
      inverse   = 1 / Math.max 1, length - 1

    b = span * inverse

    (emit, i) ->
      x = a + b * i
      callback emit, x, i

  make: () ->
    super
    @_helpers.span.make()

  unmake: () ->
    super
    @_helpers.span.unmake()

module.exports = Interval
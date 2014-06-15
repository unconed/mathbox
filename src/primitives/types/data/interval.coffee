_Array = require './array'

class Interval extends _Array
  @traits: ['node', 'data', 'array', 'span', 'interval', 'sampler']

  callback: (callback) ->
    dimension = @_get 'interval.axis'
    length    = @_get 'array.length'
    centered  = @_get 'sampler.centered'

    range     = @_helpers.span.get '', dimension

    a = range.x

    if centered
      inverse   = 1 / Math.max 1, length
      a += inverse / 2
    else
      inverse   = 1 / Math.max 1, length - 1

    b = (range.y - range.x) * inverse

    (i, emit) ->
      x = a + b * i
      callback x, i, emit

  make: () ->
    super
    @_helpers.span.make()

  unmake: () ->
    super
    @_helpers.span.unmake()

module.exports = Interval
_Array = require './array'

class Interval extends _Array
  @traits: ['node', 'data', 'array', 'span', 'interval']

  callback: (callback) ->
    dimension = @_get 'interval.axis'
    range     = @_helper.span.get '', dimension
    inverse   = 1 / Math.max 1, @length - 1

    a = range.x
    b = (range.y - range.x) * inverse

    (i, emit) ->
      x = a + b * i
      callback x, i, emit

  make: () ->
    super
    @_helper.span.make()

  unmake: () ->
    super
    @_helper.span.unmake()

module.exports = Interval
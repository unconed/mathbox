_Array = require './array'

class Interval extends _Array
  @traits: ['node', 'data', 'array', 'span', 'interval']

  callback: (callback) ->
    dimension = @_get 'interval.axis'
    range     = @_helpers.span.get '', dimension
    inverse   = 1 / Math.max 1, @_get('array.length') - 1

    a = range.x
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
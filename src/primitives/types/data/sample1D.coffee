_Array = require './array'

class Sample1D extends _Array
  @traits: ['node', 'data', 'array', 'span', 'sample1D']

  callback: (callback) ->
    dimension = @_get 'sample1D.dimension'
    range = @_helper.getSpanRange '', dimension
    inverse = 1 / Math.max 1, @length - 1

    a = range.x
    b = range.y - range.x

    (i, emit) ->
      x = range.x + (range.y - range.x) * inverse * i
      callback x, i, emit

  make: () ->
    super

    # Look up range of nearest view to inherit from
    @inherit = @_inherit 'view.range'

  unmake: () ->
    super
    delete @inherit

module.exports = Sample1D
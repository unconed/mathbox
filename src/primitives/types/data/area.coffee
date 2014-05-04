Matrix = require './matrix'

class Area extends Matrix
  @traits: ['node', 'data', 'matrix', 'span:x.span', 'span:y.span', 'area']

  callback: (callback) ->
    dimensions = @_get 'area.axes'
    width      = @_get 'matrix.width'
    height     = @_get 'matrix.height'

    rangeX     = @_helpers.span.get 'x.', dimensions.x
    rangeY     = @_helpers.span.get 'y.', dimensions.y

    inverseX  = 1 / Math.max 1, width - 1
    inverseY  = 1 / Math.max 1, height - 1

    aX = rangeX.x
    bX = (rangeX.y - rangeX.x) * inverseX

    aY = rangeY.x
    bY = (rangeY.y - rangeY.x) * inverseY

    (i, j, emit) ->
      x = aX + bX * i
      y = aY + bY * j
      callback x, y, i, j, emit

  make: () ->
    super
    @_helpers.span.make()

  unmake: () ->
    super
    @_helpers.span.unmake()

module.exports = Area
Matrix = require './matrix'

class Area extends Matrix
  @traits: ['node', 'data', 'matrix', 'span:x.span', 'span:y.span', 'area', 'sampler']

  callback: (callback) ->
    dimensions = @_get 'area.axes'
    width      = @_get 'matrix.width'
    height     = @_get 'matrix.height'
    centered   = @_get 'sampler.centered'

    rangeX     = @_helpers.span.get 'x.', dimensions.x
    rangeY     = @_helpers.span.get 'y.', dimensions.y

    aX = rangeX.x
    aY = rangeY.x

    if centered
      inverseX  = 1 / Math.max 1, width
      inverseY  = 1 / Math.max 1, height
      aX += inverseX / 2
      aY += inverseY / 2
    else
      inverseX  = 1 / Math.max 1, width - 1
      inverseY  = 1 / Math.max 1, height - 1

    bX = (rangeX.y - rangeX.x) * inverseX
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
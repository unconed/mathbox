Matrix = require './matrix'
Util = require '../../../util'

class Area extends Matrix
  @traits = ['node', 'buffer', 'active', 'data', 'source', 'index', 'matrix', 'texture', 'raw', 'span:x', 'span:y', 'area', 'sampler:x', 'sampler:y']

  updateSpan: () ->
    dimensions = @props.axes
    width      = @props.width
    height     = @props.height

    centeredX  = @props.centeredX
    centeredY  = @props.centeredY

    padX       = @props.paddingX
    padY       = @props.paddingY

    rangeX     = @_helpers.span.get 'x.', dimensions[0]
    rangeY     = @_helpers.span.get 'y.', dimensions[1]

    @aX = rangeX.x
    @aY = rangeY.x

    spanX = rangeX.y - rangeX.x
    spanY = rangeY.y - rangeY.x

    width  += padX * 2
    height += padY * 2

    if centeredX
      inverseX  = 1 / Math.max 1, width
      @aX += spanX * inverseX / 2
    else
      inverseX  = 1 / Math.max 1, width - 1

    if centeredY
      inverseY  = 1 / Math.max 1, height
      @aY += spanY * inverseY / 2
    else
      inverseY  = 1 / Math.max 1, height - 1

    @bX = spanX * inverseX
    @bY = spanY * inverseY

    @aX += padX * @bX
    @aY += padY * @bY

  callback: (callback) ->
    @updateSpan()

    return @_callback if @last == callback
    @last = callback

    if callback.length <= 5
      @_callback = (emit, i, j) =>
        x = @aX + @bX * i
        y = @aY + @bY * j
        callback emit, x, y, i, j
    else
      @_callback = (emit, i, j) =>
        x = @aX + @bX * i
        y = @aY + @bY * j
        callback emit, x, y, i, j, @bufferClock, @bufferStep

  make: () ->
    super
    @_helpers.span.make()
    @_listen @, 'span.range', @updateSpan

  unmake: () ->
    super
    @_helpers.span.unmake()

module.exports = Area
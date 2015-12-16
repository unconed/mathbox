_Array = require './array'
Util = require '../../../util'

class Interval extends _Array
  @traits = ['node', 'buffer', 'active', 'data', 'source', 'index', 'texture', 'array', 'span', 'interval', 'sampler', 'raw']

  updateSpan: () ->
    dimension = @props.axis
    width     = @props.width
    centered  = @props.centered
    pad       = @props.padding

    range     = @_helpers.span.get '', dimension

    width += pad * 2

    @a = range.x
    span = range.y - range.x

    if centered
      inverse   = 1 / Math.max 1, width
      @a += span * inverse / 2
    else
      inverse   = 1 / Math.max 1, width - 1

    @b = span * inverse

    @a += pad * @b

  callback: (callback) ->
    @updateSpan()

    return @_callback if @last == callback
    @last = callback

    if callback.length <= 3
      @_callback = (emit, i) =>
        x = @a + @b * i
        callback emit, x, i
    else
      @_callback = (emit, i) =>
        x = @a + @b * i
        callback emit, x, i, @bufferClock, @bufferStep

  make: () ->
    super
    @_helpers.span.make()
    @_listen @, 'span.range', @updateSpan

  unmake: () ->
    super
    @_helpers.span.unmake()

module.exports = Interval
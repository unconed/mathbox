_Array = require './array'
Util = require '../../../util'

class Interval extends _Array
  @traits = ['node', 'buffer', 'data', 'source', 'index', 'texture', 'array', 'span', 'interval', 'sampler', 'raw']

  updateSpan: () ->
    dimension = @props.axis
    length    = @props.length
    centered  = @props.centered
    pad       = @props.padding

    range     = @_helpers.span.get '', dimension

    length += pad * 2

    @a = range.x
    span = range.y - range.x

    if centered
      inverse   = 1 / Math.max 1, length
      @a += span * inverse / 2
    else
      inverse   = 1 / Math.max 1, length - 1

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
        callback emit, x, i, @_context.time.clock, @_context.time.delta

  make: () ->
    super
    @_helpers.span.make()
    @_listen @, 'span.range', @updateSpan

  unmake: () ->
    super
    @_helpers.span.unmake()

module.exports = Interval
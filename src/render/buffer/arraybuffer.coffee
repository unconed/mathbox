DataBuffer  = require './databuffer'
Util        = require '../../util'

###
# 1D + history array
###
class ArrayBuffer_ extends DataBuffer
  constructor: (renderer, shaders, options) ->
    @width    = options.width    || 1
    @history  = options.history  || 1

    @samples = @width
    @wrap    = @history > 1

    options.width  = @width
    options.height = @history
    options.depth  = 1
    super renderer, shaders, options

  build: (options) ->
    super

    @index    = 0
    @pad      = 0
    @streamer = @generate @data

  setActive: (i) -> @pad = Math.max 0, @width - i

  fill: () ->
    callback = @callback
    callback.reset?()

    {emit, skip, count, done, reset} = @streamer
    reset()

    limit = @samples - @pad

    i = 0
    while !done() && i < limit && callback(emit, i++) != false
      true

    Math.floor count() / @items

  write: (n = @samples) ->
    n *= @items
    @texture.write @data, 0, @index, n, 1
    @dataPointer.set .5, @index + .5
    @index = (@index + @history - 1) % @history
    @filled = Math.min @history, @filled + 1

  through: (callback, target) ->
    {consume, done} = src = @streamer
    {emit}          = dst = target.streamer

    i = 0

    pipe = () -> consume (x, y, z, w) -> callback emit, x, y, z, w, i
    pipe = Util.Data.repeatCall pipe, @items

    () =>
      src.reset()
      dst.reset()
      limit = @samples - @pad
      i = 0
      while !done() && i < limit
        pipe()
        i++

      return src.count()

module.exports = ArrayBuffer_
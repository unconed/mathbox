DataBuffer  = require './databuffer'
Util        = require '../../util'

###
# 1D + history array
###
class ArrayBuffer_ extends DataBuffer
  constructor: (renderer, shaders, options) ->
    @length   = options.length   || 1
    @history  = options.history  || 1

    @samples = @length

    options.width  = @length
    options.height = @history
    options.depth  = 1
    super renderer, shaders, options

  build: (options) ->
    super

    @index    = 0
    @pad      = 0
    @streamer = @generate @data

  setActive: (i) -> @pad = @length - i

  iterate: () ->
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

module.exports = ArrayBuffer_
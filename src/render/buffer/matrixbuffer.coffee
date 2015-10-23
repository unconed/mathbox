DataBuffer  = require './databuffer'
Util        = require '../../util'

###
# 2D + history array
###
class MatrixBuffer extends DataBuffer
  constructor: (renderer, shaders, options) ->
    @width    = options.width    || 1
    @height   = options.height   || 1
    @history  = options.history  || 1

    @samples = @width * @height
    @wrap    = @history > 1

    options.depth = @history
    super renderer, shaders, options

  build: (options) ->
    super

    @index    = 0
    @pad      = {x: 0,  y: 0}
    @streamer = @generate @data

  getFilled: () -> @filled

  setActive: (i, j) -> [@pad.x, @pad.y] = [
    Math.max(0, @width - i), Math.max(0, @height - j)
  ]

  fill: () ->
    callback = @callback
    callback.reset?()

    {emit, skip, count, done, reset} = @streamer
    reset()

    n     = @width
    pad   = @pad.x
    limit = @samples - @pad.y * n

    i = j = k = 0
    if pad
      while !done() && k < limit
        k++
        repeat = callback emit, i, j
        if ++i == n - pad
          skip pad
          i = 0
          j++
        if repeat == false
          break
    else
      while !done() && k < limit
        k++
        repeat = callback emit, i, j
        if ++i == n
          i = 0
          j++
        if repeat == false
          break

    Math.floor count() / @items

  write: (n = @samples) ->
    n     *= @items
    width  = @width * @items
    height = Math.ceil n / width

    @texture.write @data, 0, @index * @height, width, height
    @dataPointer.set .5, @index * @height + .5
    @index = (@index + @history - 1) % @history
    @filled = Math.min @history, @filled + 1

  through: (callback, target) ->
    {consume, done} = src = @streamer
    {emit}          = dst = target.streamer

    i = j = 0

    pipe = () -> consume (x, y, z, w) -> callback emit, x, y, z, w, i, j
    pipe = Util.Data.repeatCall pipe, @items

    () =>
      src.reset()
      dst.reset()

      n     = @width
      pad   = @pad.x
      limit = @samples - @pad.y * n

      i = j = k = 0
      if pad
        while !done() && k < limit
          k++
          pipe()
          if ++i == n - pad
            skip pad
            i = 0
            j++
      else
        while !done() && k < limit
          k++
          pipe()
          if ++i == n
            i = 0
            j++

      return src.count()


module.exports = MatrixBuffer
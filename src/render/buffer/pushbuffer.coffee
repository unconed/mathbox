Buffer      = require './buffer'
Util        = require '../../util'

###
# Buffer for CPU-side use
###
class PushBuffer extends Buffer
  constructor: (renderer, shaders, options) ->
    @width    = options.width    || 1
    @height   = options.height   || 1
    @depth    = options.depth    || 1

    @samples ?= @width * @height * @depth
    super renderer, shaders, options

    @build options

  build: (options) ->
    @data     = []
    @data.length = @samples

    @filled   = 0
    @pad      = {x: 0, y: 0, z: 0}
    @streamer = @generate @data

  dispose: () ->
    @data = null
    super

  getFilled: () -> @filled

  setActive: (i, j, k) -> [@pad.x, @pad.y, @pad.z] = [@width - i, @height - j, @depth - k]

  read: () -> @data

  copy: (data) ->
    n    = Math.min data.length, @samples
    d    = @data
    d[i] = data[i] for i in [0...n]

  fill: () ->
    callback = @callback
    callback.reset?()

    {emit, skip, count, done, reset} = @streamer
    reset()

    n     = @width
    m     = @height
    o     = @depth
    padX  = @pad.x
    padY  = @pad.y
    limit = @samples - @pad.z * n * m

    i = j = k = l = 0
    if padX > 0 or padY > 0
      while !done() && l < limit
        l++
        repeat = callback emit, i, j, k
        if ++i == n - padX
          skip padX
          i = 0
          if ++j == m - padY
            skip n * padY
            j = 0
            k++
        if repeat == false
          break
    else
      while !done() && l < limit
        l++
        repeat = callback emit, i, j, k
        if ++i == n
          i = 0
          if ++j == m
            j = 0
            k++
        if repeat == false
          break

    @filled = 1
    count()

module.exports = PushBuffer
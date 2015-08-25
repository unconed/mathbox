DataBuffer  = require './databuffer'
Util        = require '../../util'

#
# 3D array
#
class VoxelBuffer extends DataBuffer
  build: (options) ->
    super
    @pad      = {x: 0, y: 0, z: 0}
    @streamer = @generate @data

  setActive: (i, j, k) -> [@pad.x, @pad.y, @pad.z] = [
    Math.max(0, @width - i), Math.max(0, @height - j), Math.max(0, @depth - k)
  ]

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

    Math.floor count() / @items

  through: (callback, target) ->
    # must be identical sized buffers w/ identical active areas

    {consume, done} = src = @streamer
    {emit}          = dst = target.streamer

    i = j = k = 0

    pipe = () -> consume (x, y, z, w) -> callback emit, x, y, z, w, i, j, k
    pipe = Util.Data.repeatCall pipe, @items

    () =>
      src.reset()
      dst.reset()

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
          pipe()
          if ++i == n - padX
            skip padX
            i = 0
            if ++j == m - padY
              skip n * padY
              j = 0
              k++
      else
        while !done() && l < limit
          l++
          pipe()
          if ++i == n
            i = 0
            if ++j == m
              j = 0
              k++

      return src.count()

module.exports = VoxelBuffer
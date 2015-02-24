DataBuffer  = require './databuffer'
Util        = require '../../util'

class VoxelBuffer extends DataBuffer
  build: (options) ->
    super
    @pad      = {x: 0, y: 0, z: 0}
    @streamer = @generate @data

  getFilled: () -> @filled

  setActive: (i, j, k) -> [@pad.x, @pad.y, @pad.z] = [@width - i, @height - j, @depth - k]

  iterate: () ->
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


module.exports = VoxelBuffer
DataBuffer  = require './databuffer'
Util        = require '../../util'

###
# 4D array
###
class ItemBuffer extends DataBuffer
  build: (options) ->
    super
    @pad      = {x: 0, y: 0, z: 0, w: 0}
    @streamer = @generate @data

  getFilled: () -> @filled

  setActive: (i, j, k, l) -> [@pad.x, @pad.y, @pad.z, @pad.w] = [@width - i, @height - j, @depth - k, @items - l]

  fill: () ->
    callback = @callback
    callback.reset?()

    {emit, skip, count, done, reset} = @streamer
    reset()

    n     = @width
    m     = @height
    o     = @depth
    p     = @items
    padX  = @pad.x
    padY  = @pad.y
    padW  = @pad.w
    limit = (@samples - @pad.z * n * m) * p

    i = j = k = l = m = 0
    if padX > 0 or padY > 0 or padW > 0
      while !done() && m < limit
        m++
        repeat = callback emit, i, j, k, l
        if ++l == p - padW
          skip padW
          l = 0
          if ++i == n - padX
            skip p * padX
            i = 0
            if ++j == m - padY
              skip p * n * padY
              j = 0
              k++
        if repeat == false
          break
    else
      while !done() && m < limit
        m++
        repeat = callback emit, i, j, k, l
        if ++l == p
          l = 0
          if ++i == n
            i = 0
            if ++j == m
              j = 0
              k++
        if repeat == false
          break

    Math.floor count() / @items


module.exports = ItemBuffer
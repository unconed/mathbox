Data = require './data'
Util = require '../../../util'

class Buffer extends Data
  @traits = ['node', 'buffer', 'data', 'source', 'index', 'texture']

  init: () ->
    @bufferSlack  = 0
    @bufferFrames = 0

    super

  rawBuffer: () -> @buffer

  emitter: () ->
    {channels, items} = @props

    super channels, items

  syncBuffer: (callback) ->
    return unless @buffer
    {live, fps, hurry} = @props

    filled = @buffer.getFilled()
    return unless !filled or live

    if fps
      @bufferSlack += @_context.time.delta
      frames = Math.min hurry, Math.floor @bufferSlack * fps
      stop = false
      abort = () -> stop = true
      for i in [0...frames]
        break if stop
        callback abort, @bufferFrames++, i, frames
        @bufferSlack -= 1 / fps
    else
      callback (()->), @bufferFrames++, 0, 1

module.exports = Buffer
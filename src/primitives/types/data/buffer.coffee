Data = require './data'
Util = require '../../../util'

class Buffer extends Data
  @traits = ['node', 'buffer', 'data', 'source', 'index', 'texture']

  init: () ->
    @bufferSlack  = 0
    @bufferFrames = 0

    @bufferTime   = 0
    @bufferDelta  = 0

    @bufferClock  = 0
    @bufferStep   = 0

    super

  rawBuffer: () -> @buffer

  emitter: () ->
    {channels, items} = @props

    super channels, items

  change: (changed, touched, init) ->
    if changed['buffer.fps'] or init

      {fps} = @props
      @bufferSlack = if fps then .5 / fps else 0

  syncBuffer: (callback) ->
    return unless @buffer
    {live, fps, hurry, limit, realtime, observe} = @props

    filled = @buffer.getFilled()
    return unless !filled or live

    if fps?
      slack = @bufferSlack
      speed = @_context.time.step / @_context.time.delta
      delta = if realtime then @_context.time.delta else @_context.time.step
      frame = 1 / fps
      step  = if realtime and observe then speed * frame else frame

      @bufferSlack = Math.min limit / fps, slack + delta
      @bufferDelta = delta
      @bufferStep  = step

      frames = Math.min hurry, Math.floor slack * fps
      frames = Math.max 1, frames if !filled

      stop = false
      abort = () -> stop = true
      for i in [0...frames]
        @bufferTime  += delta
        @bufferClock += step

        break if stop
        callback abort, @bufferFrames++, i, frames

        @bufferSlack -= frame
    else
      @bufferTime  = @_context.time.time
      @bufferDelta = @_context.time.delta
      @bufferClock = @_context.time.clock
      @bufferStep  = @_context.time.step
      callback (()->), @bufferFrames++, 0, 1

module.exports = Buffer
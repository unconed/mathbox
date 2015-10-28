Data = require './data'
Util = require '../../../util'

class Buffer extends Data
  @traits = ['node', 'buffer', 'active', 'data', 'source', 'index', 'texture']

  init: () ->
    @bufferSlack  = 0
    @bufferFrames = 0

    @bufferTime   = 0
    @bufferDelta  = 0

    @bufferClock  = 0
    @bufferStep   = 0
    super

  make: () ->
    super

    @clockParent = @_inherit 'clock'

  unmake: () ->
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

    time = @clockParent.getTime()

    if fps?
      slack = @bufferSlack
      speed = time.step / time.delta
      delta = if realtime then time.delta else time.step
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
      @bufferTime  = time.time
      @bufferDelta = time.delta
      @bufferClock = time.clock
      @bufferStep  = time.step
      callback (()->), @bufferFrames++, 0, 1

  alignShader: (dims, shader) ->
    {minFilter, magFilter, aligned} = @props
    mixed = (dims.items > 1 and dims.width > 1) or (dims.height > 1 and dims.depth > 1)

    return if aligned or !mixed

    nearest = minFilter == @node.attributes['texture.minFilter'].enum.nearest and
              magFilter == @node.attributes['texture.magFilter'].enum.nearest

    if !nearest
      console.warn "#{@node.toString()} - Cannot use linear min/magFilter with 3D/4D sampling"

    shader.pipe 'map.xyzw.align'

module.exports = Buffer
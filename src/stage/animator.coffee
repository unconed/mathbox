{Ease} = require '../util'

class Animator
  constructor: (@context) ->
    @anims = []

  make: (type, options) ->
    anim = new Animation @, @context.time, type, options
    @anims.push anim
    anim

  unmake: (anim) ->
    @anims = (a for a in @anims when a != anim)

  update: () ->
    {time} = @context
    @anims = (anim for anim in @anims when anim.update(time) != false)

  lerp: (type, from, to, f, value) ->
    value ?= type.make()

    # Use the most appropriate interpolation method for the type

    # Direct lerp operator
    if type.lerp
      value = type.lerp from, to, value, f

    # Substitute emitter
    else if type.emitter

      fromE = from.emitterFrom
      toE   = to  .emitterTo

      if fromE? and toE? and fromE == toE
        fromE.lerp f
        return fromE

      else
        emitter = type.emitter from, to
        from.emitterFrom = emitter
        to  .emitterTo   = emitter

    # Generic binary operator
    else if type.op
      lerp = (a, b) ->
        if a == +a and b == +b
          # Lerp numbers
          a + (b - a) * f
        else
          # No lerp
          if f > .5 then b else a

      value = type.op from, to, value, lerp

    # No lerp
    else
      value = if f > .5 then to else from

    value

class Animation
  constructor: (@animator, @time, @type, @options) ->
    @value   = @type.make()
    @target  = @type.make()

    @queue   = []

  dispose: () -> @animator.unmake @

  set: () ->
    target = @target
    value  = if arguments.length > 1 then [].slice.call arguments else arguments[0]

    invalid = false
    value   = @type.validate value, target, () -> invalid = true
    target  = value if !invalid

    @cancel()
    @target = @value
    @value  = target
    @notify()

  getTime: () ->
    clock = @options.clock
    time  = if clock then clock.getTime() else @time
    if @options.realtime then time.time else time.clock

  cancel: (from) ->
    from ?= @getTime()
    queue = @queue

    cancelled = (stage for stage in queue when stage.end >= from)
    @queue    = (stage for stage in queue when stage.end < from)

    stage.complete?(false) for stage in cancelled
    @options.complete?(false)
    return

  notify: () ->
    @options.step? @value

  immediate: (value, options) ->
    {duration, delay, ease, step, complete} = options

    time = @getTime()

    start = time + delay
    end   = start + duration

    invalid = false
    target  = @type.make()
    value   = @type.validate value, target, () -> invalid = true; null
    target  = value if value != undefined

    @cancel start
    @queue.push {from: null, to: target, start, end, ease, step, complete}

  update: (@time) ->
    if @queue.length == 0
      return true

    clock = @getTime()
    {value, queue} = @

    active = false
    while !active
      {from, to, start, end, step, complete, ease} = stage = queue[0]

      from = stage.from = @type.clone @value if !from?

      f = Ease.clamp(((clock - start) / Math.max(0.00001, end - start)) || 0, 0, 1)
      return if f == 0 # delayed animation not yet active

      method = switch ease
        when 'linear', 0 then null
        when 'cosine', 1 then Ease.cosine
        when 'binary', 2 then Ease.binary
        when 'hold',   3 then Ease.hold
        else                  Ease.cosine
      f = method f if method?

      active = f < 1
      value = if active then @animator.lerp @type, from, to, f, value else to

      #console.log 'animation step', f, from, to, value
      step? value

      if !active
        complete?(true)
        @options.complete?(true)
        queue.shift()
        break if queue.length == 0 # end of queue

    @value = value
    @notify()

module.exports = Animator
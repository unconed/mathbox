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

    if type.lerp
      value = type.lerp from, to, value, f

    else if type.op
      lerp = (a, b) ->
        if a == +a and b == +b
          a + (b - a) * f
        else
          if f > .5 then b else a

      value = type.op from, to, value, lerp

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

  cancel: (from = @time.clock) ->
    queue = @queue

    cancelled = (stage for stage in queue when stage.end >= from)
    @queue    = (stage for stage in queue when stage.end < from)

    stage.complete?() for stage in cancelled
    @options.complete?()
    return

  notify: () ->
    @options.step? @value

  immediate: (value, options) ->
    {duration, delay, ease, step, complete} = options

    time = if @options.realTime then @realTime() else @time.clock

    start = time + delay
    end   = start + duration

    invalid = false
    target  = @type.make()
    value   = @type.validate value, target, () -> invalid = true; null
    target  = value if value != undefined

    @cancel start
    @queue.push {from: null, to: target, start, end, ease, step, complete}

  realTime: () -> +new Date() / 1000

  update: (@time) ->
    if @queue.length == 0
      @notify() if @options.live
      return true

    clock = if @options.realTime then @realTime() else @time.clock
    {value, queue} = @

    active = false
    while !active
      {from, to, start, end, step, complete, ease} = stage = queue[0]

      from = stage.from = @type.clone @value if !from?

      f = Ease.clamp(((clock - start) / (end - start)) || 0, 0, 1)
      return if f == 0 # delayed animation not yet active

      method = switch ease
        when 'linear', 0 then null
        when 'cosine', 1 then Ease.cosine
        else                  Ease.cosine
      f = method f if method?

      value = @animator.lerp @type, from, to, f, value

      #console.log 'animation step', f, from, to, value

      step? value
      active = f < 1

      if !active
        complete?()
        queue.shift()
        break if queue.length == 0 # end of queue

    @value = value
    @notify()

module.exports = Animator
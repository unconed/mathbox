Primitive = require '../../primitive'
{Ease} = require '../../../util'

deepCopy = (x) ->
  out = {}
  for k, v of x
    if v instanceof Array
      out[k] = v.slice()
    else if v? and typeof v == 'object'
      out[k] = deepCopy v
    else
      out[k] = v

  out

class Track extends Primitive
  @traits = ['node', 'track', 'seek', 'bind']

  init: () ->
    @handlers = {}
    @script   = null
    @values   = null
    @playhead = 0
    @velocity = null
    @section  = null
    @expr     = null

  make: () ->
    # Bind to attached data sources
    @_helpers.bind.make [
      { to: 'track.target', trait: 'node', callback: null }
    ]

    {script} = @props
    {node} = @bind.target

    @targetNode = node
    [@script, @values, @start, @end] = @_process node, script

  unmake: () ->
    @unbindExpr()
    @_helpers.bind.unmake()
    @script = @values = @start = @end = @section = @expr = null
    @playhead = 0

  # Bind animated expressions
  bindExpr: (expr) ->
    @unbindExpr()
    @expr = expr
    @targetNode.bind expr, true

    # Measure playhead velocity on attribute computation
    {clock} = @targetNode
    @_attributes.bind @measure = do ->
      playhead = null
      () =>
        {step} = clock.getTime()
        @velocity = (@playhead - playhead) / step if playhead?
        playhead = @playhead

  unbindExpr: () ->
    @targetNode .unbind @expr, true if @expr?
    @_attributes.unbind @measure if @measure?
    @expr = @measure = null

  # Process script steps by filling out missing props
  _process: (object, script) ->

    if script instanceof Array
      # Normalize array to numbered dict
      s = {}
      s[i] = step for step, i in script
      script = s

    # Normalize keyed steps to array of step objects
    s = []
    for key, step of script
      step ?= []

      if step instanceof Array
        # [props, expr] array
        step =
          key: +key
          props: if step[0]? then deepCopy(step[0]) else {}
          expr:  if step[1]? then deepCopy(step[1]) else {}
      else
        if !step.key? and !step.props and !step.expr
          # Direct props object (iffy, but people will do this anyhow)
          step = {props: deepCopy step}
        else
          # Proper step
          step = deepCopy step

        # Prepare step object
        step.key = if step.key? then +step.key else +key
        step.props ?= {}
        step.expr  ?= {}

      s.push step
    script = s

    return [[], {}, 0, 0] if !script.length

    # Sort by keys
    script.sort (a, b) -> a.key - b.key
    start = script[0].key
    end   = script[script.length - 1].key

    # Connect steps
    for key, step of script
      last.next = step if last?
      last = step

    # Last step leads to itself
    last.next = last
    script = s

    # Determine starting props
    props  = {}
    values = {}
    props[k]  = true         for k, v of step.props for key, step of script
    props[k]  = true         for k, v of step.expr  for key, step of script
    props[k]  = object.get k for k    of props
    try
      # Need two sources and one destination value for correct mixing of live expressions
      values[k] = [
        object.attribute(k).T.make(),
        object.attribute(k).T.make(),
        object.attribute(k).T.make(),
      ] for k of props
    catch
      console.warn @node.toMarkup()
      message = "#{@node.toString()} - Target #{object} has no `#{k}` property"
      throw new Error message

    result = []

    # Normalize script props, insert held values
    for step in script
      for k, v of props
        v = object.validate k, step.props[k] ? v
        props[k] = step.props[k] = v

        if step.expr[k]? && typeof step.expr[k] != 'function'
          console.warn @node.toMarkup()
          message = "#{@node.toString()} - Expression `#{step.expr[k]}` on property `#{k}` is not a function"
          throw new Error message
      result.push step

    [result, values, start, end]

  update: () ->
    {playhead, script} = @
    {ease, seek} = @props
    node = @targetNode

    playhead = seek if seek?

    if script.length
      find = () ->
        last = script[0]
        for step, i in script
          break if step.key > playhead
          last = step
        last

      section = @section
      section = find script, playhead if !section or playhead < section.key or playhead > section.next.key

      return if section == @section
      @section = section

      from  = section
      to    = section.next
      start = from.key
      end   = to.key

      # Easing of playhead along track
      easeMethod = switch ease
        when 'linear', 0 then Ease.clamp
        when 'cosine', 1 then Ease.cosine
        when 'binary', 2 then Ease.binary
        when 'hold',   3 then Ease.hold
        else                  Ease.cosine

      # Callback for live playhead interpolator (linear approx time travel)
      {clock} = node
      getPlayhead = (time) =>
        return @playhead unless @velocity?
        now = clock.getTime()
        @playhead + @velocity * (time - now.time)

      getLerpFactor = do ->
        scale = 1 / Math.max(0.0001, end - start)
        (time) -> easeMethod (getPlayhead(time) - start) * scale, 0, 1

      # Create prop expression interpolator
      live = (key) =>

        fromE = from.expr[key]
        toE   = to  .expr[key]
        fromP = from.props[key]
        toP   = to  .props[key]

        invalid = () ->
          console.warn node.toMarkup()
          throw new Error "#{@node.toString()} - Invalid expression result on track `#{key}`"

        attr = node.attribute(key)
        values = @values[key]
        animator = @_animator

        # Lerp between two expressions
        if fromE and toE
          do (values, from, to) ->
            (time, delta) ->
              values[0] = _from = attr.T.validate fromE(time, delta), values[0], invalid
              values[1] = _to   = attr.T.validate   toE(time, delta), values[1], invalid
              values[2] = animator.lerp attr.T, _from, _to, getLerpFactor(time), values[2]

        # Lerp between an expression and a constant
        else if fromE
          do (values, from, to) ->
            (time, delta) ->
              values[0] = _from = attr.T.validate fromE(time, delta), values[0], invalid
              values[1] = animator.lerp attr.T, _from, toP, getLerpFactor(time), values[1]

        # Lerp between a constant and an expression
        else if toE
          do (values, from, to) ->
            (time, delta) ->
              values[0] = _to = attr.T.validate toE(time, delta), values[0], invalid
              values[1] = animator.lerp attr.T, fromP, _to, getLerpFactor(time), values[1]

        # Lerp between two constants
        else
          do (values, from, to) ->
            (time, delta) ->
              values[0] = animator.lerp attr.T, fromP, toP, getLerpFactor(time), values[0]

      # Handle expr / props on both ends
      expr = {}
      expr[k] ?= live k for k of from.expr
      expr[k] ?= live k for k of to  .expr
      expr[k] ?= live k for k of from.props
      expr[k] ?= live k for k of to  .props

      # Bind node props
      @bindExpr expr

  change: (changed, touched, init) ->
    return @rebuild() if changed['track.target'] or
                         changed['track.script'] or
                         changed['track.mode']

    if changed['seek.seek'] or
       init

      @update()

module.exports = Track
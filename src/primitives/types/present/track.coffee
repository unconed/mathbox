Primitive = require '../../primitive'
{Ease} = require '../../../util'

class Track extends Primitive
  @traits = ['node', 'track', 'bind']

  init: () ->
    @handlers = {}
    @script   = null
    @values   = null
    @animate  = null
    @playhead = 0
    @paused   = null

  make: () ->
    # Bind to attached data sources
    @_helpers.bind.make [
      { to: 'track.target', trait: 'node' }
    ]

    {script} = @props
    {node} = @bind.target

    [@script, @values, @start, @end] = @_process node, script if script?

  unmake: () ->
    @_helpers.bind.unmake()
    @script = null

  # Process script steps by filling out missing props
  _process: (object, script) ->

    clone = (o) -> JSON.parse JSON.stringify o

    if script instanceof Array
      # Normalize array to numbered dict
      s = {}
      s[i] = step for step, i in script
      script = s

    # Normalize keyed steps to array of step objects
    s = []
    for key, step of script
      if step instanceof Array
        # [props, expr] array
        s.push {key: +key, props: step[0] ? {}, expr: step[1] ? {}}
      else
        # Direct props object
        step = {props: step} if !step.key? and !step.props and !step.expr

        # Prepare step object
        step.key = if step.key? then +step.key else +key
        step.props ?= {}
        step.expr  ?= {}

        s.push step
    script = s

    # Sort by keys
    script.sort (a, b) -> a.key - b.key
    start = script[0].key
    end   = script[script.length - 1].key

    # Determine starting props
    props  = {}
    values = {}
    props[k]  = true         for k, v of step.props for key, step of script
    props[k]  = true         for k, v of step.expr  for key, step of script
    props[k]  = object.get k for k    of props
    try
      values[k] = object.attribute(k).T.make()
    catch
      console.warn @node.toMarkup()
      message = "#{@node} - Unknown property `#{k}` = `#{props[k]}` in script"
      throw new Error message

    result = []

    # Normalize script props, insert held values
    for step in script
      for k, v of props
        v = object.validate k, step.props[k] ? v
        props[k] = step.props[k] = v

        if step.expr[k]? && typeof step.expr[k] != 'function'
          console.warn @node.toMarkup()
          message = "#{@node} - Expression `#{step.expr[k]}` on property `#{k}` is not a function"
          throw new Error message
      result.push step

    [result, values, start, end]

  update: () ->
    {playhead, script, paused} = @
    {ease} = @props
    {node} = @bind.target

    playhead = paused if paused?
    time  = @_context.time.clock
    delta = @_context.time.delta

    if script.length
      last = null
      for step, i in script
        break if step.key > playhead
        last = step

      if last
        from  = last
        start = last.key
      if step
        to    = step
        end   = step.key

      from  ?= to
      to    ?= from
      start ?= end
      end   ?= start

      # Easing of interpolation along track
      f = Ease.clamp (playhead - start) / Math.max(0.0001, end - start), 0, 1
      method = switch ease
        when 'linear', 0 then null
        when 'cosine', 1 then Ease.cosine
        else                  Ease.cosine
      f = method f if method?

      # Interpolate prop on track
      map = (key, from, to) =>
        attr = node.attribute key
        @values[key] = @_animator.lerp attr.T, from, to, f, @values[key]
        #console.log "@_animator.lerp", attr.T, from, to, f, @values[key]
        #@values[key]

      # Live prop expressions
      from.props[k] = node.validate k, expr(time, delta, playhead) for k, expr of from.expr
      to  .props[k] = node.validate k, expr(time, delta, playhead) for k, expr of to  .expr if from != to

      # Live
      live = !!(Object.keys(from.expr).length + Object.keys(to.expr).length)
      @animate.options.live = live if @animate?

      # Calculate current values
      props = {}
      props[k] = map k, from.props[k], to.props[k] for k, v of from.props

      console.log @node.toString(), 'node.set', props, @playhead, f, from.props, to.props, start, end if @node.id == 'enterexit2'

      node.set props, true

    {expr} = @props
    if expr?
      props = expr.call node, playhead, time, delta
      node.set props if typeof props == 'object'

  change: (changed, touched, init) ->
    return @rebuild() if changed['track.target'] or
                         changed['track.script'] or
                         changed['track.mode']

    if changed['track.seek'] or
       init

      {seek} = @props
      if seek?
        @paused = seek
        @update()

module.exports = Track
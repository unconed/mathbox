Parent = require '../base/parent'
Util = require '../../../util'

class Transition extends Parent
  @traits = ['node', 'transition', 'transform', 'mask', 'visible', 'active']

  init: () ->
    @animate = null
    @uniforms = null

    @state =
      isVisible: true
      isActive:  true
      enter:     1
      exit:      1

    @latched = null
    @locked  = null

  make: () ->
    @uniforms =
      transitionFrom:     @_attributes.make @_types.vec4()
      transitionTo:       @_attributes.make @_types.vec4()

      transitionActive:   @_attributes.make @_types.bool()
      transitionScale:    @_attributes.make @_types.vec4()
      transitionBias:     @_attributes.make @_types.vec4()
      transitionEnter:    @_attributes.make @_types.number()
      transitionExit:     @_attributes.make @_types.number()
      transitionSkew:     @_attributes.make @_types.number()

    slideParent   = @_inherit('slide')
    visibleParent = @_inherit('visible')
    activeParent  = @_inherit('active')

    @_listen slideParent,   'transition.latch',   (e) => @latch e.step
    @_listen slideParent,   'transition.release', ()  => @release()

    @_listen visibleParent, 'visible.change',     ()  =>
      #console.log @node.toString(), 'visible.change ^', visibleParent.isVisible
      @update (@state.isVisible = visibleParent.isVisible)

    @_listen activeParent,  'active.change',      ()  =>
      #console.log @node.toString(), 'active.change ^', activeParent.isActive
      @update (@state.isActive  = activeParent.isActive)

    @animate = @_animator.make @_types.vec2(1, 1),
      step: (value) =>
        @state.enter     = value.x
        @state.exit      = value.y
        @update()
      complete: (done) => @complete done

    @move = @props.from? or @props.to?

    #@_helpers.visible.make()
    #@_helpers.active.make()

  unmake: () ->
    @animate.dispose()

    #@_helpers.visible.unmake()
    #@_helpers.active.unmake()

  latch: (step) ->
    @locked  = null
    @latched = latched =
      isVisible: @state.isVisible
      isActive:  @state.isActive
      step:      step

    # Reset enter/exit animation if invisible
    visible = @isVisible
    if !visible
      forward = latched.step >= 0
      [enter, exit] = if forward then [0, 1] else [1, 0]
      @animate.set enter, exit

    #console.log @node.toString(), 'transition::latch', @latched, enter, exit

  release: () ->
    # Get before/after and unlatch state
    latched = @latched
    state   = @state
    @latched = null

    #console.log @node.toString(), 'transition::release', JSON.parse JSON.stringify {latched, state}

    #p = @; console.log '-> ', p.node.toString(), p.isVisible while p = p._inherit 'visible'

    # Transition if visibility state change
    if latched.isVisible != state.isVisible

      # Maintain step direction
      forward = latched.step >= 0
      visible = state.isVisible
      [enter, exit] = if visible then [1, 1] else if forward then [1, 0] else [0, 1]

      # Get duration
      {duration, durationEnter, durationExit} = @props
      durationEnter ?= duration
      durationExit  ?= duration
      duration = visible * durationEnter + !visible * durationExit

      # Get delay
      {delay, delayEnter, delayExit} = @props
      delayEnter ?= delay
      delayExit  ?= delay
      delay = visible * delayEnter + !visible * delayExit

      # Animate enter/exit
      #console.log @node.toString(), '@animate.immediate', {x: enter, y: exit}, {duration, delay, ease: 'linear'}
      @animate.immediate {x: enter, y: exit}, {duration, delay, ease: 'linear'}

      # Lock visibility and active open during transition
      @locked  =
        isVisible: true
        isActive:  latched.isActive or state.isActive

    @update()

  complete: (done) ->
    return if !done
    @locked = null
    @update()

  update: () ->
    return if @latched? # latched

    {enter, exit} = @props

    # Resolve transition state
    enter  ?= @state.enter
    exit   ?= @state.exit

    level   = enter * exit
    visible = level > 0
    partial = level < 1

    @uniforms.transitionEnter .value = enter
    @uniforms.transitionExit  .value = exit
    @uniforms.transitionActive.value = partial

    # Resolve visibility state
    visible = !!@state.isVisible if visible
    visible =  @locked.isVisible if @locked?

    if @isVisible != visible
      @isVisible = visible
      @trigger type: 'visible.change'

    # Resolve active state
    active = !!(@state.isActive or @locked?.isActive)

    if @isActive != active
      @isActive = active
      @trigger type: 'active.change'

    #console.log 'transition update', 'enter', enter, 'exit', exit, 'visible', visible, 'active', active


  change: (changed, touched, init) ->

    if changed['transition.enter'] or
       changed['transition.exit']  or
       init

      @update()

    if changed['transition.stagger'] or
       init

      {stagger} = @props

      # Precompute shader constants

      flipX = stagger.x < 0
      flipY = stagger.y < 0
      flipZ = stagger.z < 0
      flipW = stagger.w < 0

      staggerX = Math.abs stagger.x
      staggerY = Math.abs stagger.y
      staggerZ = Math.abs stagger.z
      staggerW = Math.abs stagger.w

      @uniforms.transitionSkew.value = staggerX + staggerY + staggerZ + staggerW

      @uniforms.transitionScale.value.set (1 - flipX * 2) * staggerX,
                                          (1 - flipY * 2) * staggerY,
                                          (1 - flipZ * 2) * staggerZ,
                                          (1 - flipW * 2) * staggerW

      @uniforms.transitionBias.value.set  flipX * staggerX,
                                          flipY * staggerY,
                                          flipZ * staggerZ,
                                          flipW * staggerW

module.exports = Transition
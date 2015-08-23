Parent = require '../base/parent'
Util = require '../../../util'

class Transition extends Parent
  @traits = ['node', 'transition', 'transform', 'mask', 'visible', 'active']

  init: () ->
    @transitionSkew = @transitionBias = @transitionScale = @transitionActive = @transitionEnter = @transitionExit = null

    @animate = null

    @state =
      isVisible: true
      isActive:  true
      enter:     1
      exit:      1

    @latched = null
    @locked  = null

  make: () ->
    @uniforms =
      transitionFrom:     @node.attributes['transition.from']
      transitionTo:       @node.attributes['transition.to']

      transitionActive:   @_attributes.make @_types.bool()
      transitionScale:    @_attributes.make @_types.vec4()
      transitionBias:     @_attributes.make @_types.vec4()
      transitionEnter:    @_attributes.make @_types.number()
      transitionExit:     @_attributes.make @_types.number()
      transitionSkew:     @_attributes.make @_types.number()

    @transitionScale  = @uniforms.transitionScale.value
    @transitionBias   = @uniforms.transitionBias.value
    @transitionActive = @uniforms.transitionActive
    @transitionEnter  = @uniforms.transitionEnter
    @transitionExit   = @uniforms.transitionExit
    @transitionSkew   = @uniforms.transitionSkew

    slideParent   = @_inherit('slide')
    visibleParent = @_inherit('visible')
    activeParent  = @_inherit('active')

    @_listen slideParent,   'transition.latch',   (e) => @latch e.step
    @_listen visibleParent, 'visible.change',     ()  => @update (@state.isVisible = visibleParent.isVisible)
    @_listen activeParent,  'active.change',      ()  => @update (@state.isActive  = activeParent.isActive)
    @_listen slideParent,   'transition.release', ()  => @release()

    @animate = @_animator.make @_types.vec2(1, 1),
      step: (value) =>
        @state.enter     = value.x
        @state.exit      = value.y
        @update()
      complete: () => @complete()

  unmake: () ->
    @animate.dispose()

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

  release: () ->
    # Get before/after and unlatch state
    latched = @latched
    state   = @state
    @latched = null

    # Transition if visibility state change
    if latched.isVisible != state.isVisible

      # Maintain step direction
      forward = latched.step >= 0
      visible = state.isVisible
      [enter, exit] = if visible then [1, 1] else if forward then [1, 0] else [0, 1]

      # Total duration
      {duration, durationEnter, durationExit} = @props
      duration += visible * durationEnter + !visible * durationExit

      # Total delay
      {delay, delayEnter, delayExit} = @props
      delay += visible * delayEnter + !visible * delayExit

      # Animate enter/exit
      @animate.immediate {x: enter, y: exit}, {duration, delay, ease: 'linear'}

      # Lock visibility and active open during transition
      @locked  =
        isVisible: true
        isActive:  latched.isActive or state.isActive

    @update()

  complete: () ->
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

    @transitionEnter .value = enter
    @transitionExit  .value = exit
    @transitionActive.value = partial

    # Resolve visibility state
    visible = !!(@state.isVisible or @locked?.isVisible) if visible

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

      @transitionSkew.value = staggerX + staggerY + staggerZ + staggerW

      @transitionScale.set (1 - flipX * 2) * staggerX,
                           (1 - flipY * 2) * staggerY,
                           (1 - flipZ * 2) * staggerZ,
                           (1 - flipW * 2) * staggerW

      @transitionBias.set  flipX * staggerX,
                           flipY * staggerY,
                           flipZ * staggerZ,
                           flipW * staggerW

  mask: (shader) ->
    if shader
      s = @_shaders.shader()
      s.pipe Util.GLSL.identity 'vec4'
      s.fan()
      s  .pipe shader, @uniforms
      s.next()
      s  .pipe 'transition.mask', @uniforms
      s.end()
      s.pipe "float combine(float a, float b) { return min(a, b); }"
    else
      s = @_shaders.shader()
      s.pipe 'transition.mask', @uniforms

    @_inherit('mask')?.mask(s) ? s

  transform: (shader, pass) ->
    shader.pipe 'transition.position', @uniforms if pass == @props.pass
    @_inherit('transform')?.transform(shader, pass) ? shader

module.exports = Transition
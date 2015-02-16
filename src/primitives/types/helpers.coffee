Util = require '../../util'
View = require './view/view'

###

This is the general dumping ground for trait behavior.

Helpers are auto-attached to primitives that have the matching trait

###

helpers =

  bind:
    make: (map) ->
      @bind = {}

      # Fetch attached objects and bind to them
      # Attach watchers for DOM changes
      for key, trait of map
        name     = key.split(/\./g).pop()
        selector = @_get key
        source   = if selector? then @_attach selector, trait, @rebuild else null

        # Monitor source for reallocation / resize
        if source?
          @_listen source, 'source.resize',  @resize
          @_listen source, 'source.rebuild', @rebuild

        @bind[name] = source

      null

    unmake: () ->
      return unless @bind
      delete @bind

  span:
    make: () ->
      # Look up nearest view to inherit from
      # Monitor size changes
      @spanView = @_inherit 'view'
      @_listen 'view', 'view.range', @refresh

    unmake: () ->
      delete @spanView

    get: do ->
      def = new THREE.Vector2 -1, 1

      (prefix, dimension) ->
        # Return literal range
        range = @_get prefix + 'span.range'
        return range if range?

        # Inherit from view
        return @spanView?.axis(dimension) ? def

  scale:
    # Divisions to allocate on scale
    divide: (prefix) ->
      divide = @_get prefix + 'scale.divide'
      Math.round divide * 2.5

    # Generate ticks on scale
    generate: (prefix, buffer, min, max) ->
      divide = @_get prefix + 'scale.divide'
      unit   = @_get prefix + 'scale.unit'
      base   = @_get prefix + 'scale.base'
      mode   = @_get prefix + 'scale.mode'

      ticks = Util.Ticks.make mode, min, max, divide, unit, base, true, 0
      buffer.copy ticks
      ticks

  style:
    # Return bound style uniforms
    uniforms: () ->
      styleColor:   @node.attributes['style.color']
      styleOpacity: @node.attributes['style.opacity']
      styleZIndex:  @node.attributes['style.zIndex']

  arrow:
    # Return bound arrow style uniforms
    uniforms: () ->
      start   = @_get 'arrow.start'
      end     = @_get 'arrow.end'

      space = @_attributes.make @_types.number 1 / (start + end)
      style = @_attributes.make @_types.vec2 +start, +end
      size  = @node.attributes['arrow.size']

      clipStyle:  style
      clipRange:  size
      clipSpace:  space

      arrowSpace: space
      arrowSize:  size

  point:
    # Return bound point style uniforms
    uniforms: () ->
      pointSize:   @node.attributes['point.size']

  line:
    # Return bound line style uniforms
    uniforms: () ->
      lineWidth:   @node.attributes['line.width']
      lineDepth:   @node.attributes['line.depth']

  surface:
    # Return bound surface style uniforms
    uniforms: () -> {}

  position:
    pipeline: (shader) ->
      shader = @_inherit('transform')?.transform shader, pass for pass in [0..3]
      shader

  object:
    # Generic 3D renderable wrapper, handles the fiddly Three.js bits that require a 'style recalculation'.
    #
    # Pass renderables to nearest root for rendering
    # Track visibility from parent and notify children
    # Track blends / transparency for three.js materials
    make: (@objects = []) ->
      objectParent = @_inherit 'object'
      objectScene  = @_inherit 'scene'

      e       = type: 'object.visible'
      opacity = blending = zOrder = zUnits = zFactor = null

      hasStyle = 'style' in @traits
      opacity  = 1
      visible  = @_get 'object.visible'
      blending = THREE.NormalBlending
      zWrite   = true
      zTest    = true

      if hasStyle
        opacity  = @_get 'style.opacity'
        blending = @_get 'style.blending'
        zFactor  = @_get 'style.zFactor'
        zUnits   = @_get 'style.zUnits'
        zOrder   = @_get 'style.zOrder'
        zWrite   = @_get 'style.zWrite'
        zTest    = @_get 'style.zTest'

      onChange = (event) =>
        changed  = event.changed
        refresh  = null
        refresh  = visible  = @_get 'object.visible' if changed['object.visible']
        refresh  = opacity  = @_get 'style.opacity'  if changed['style.opacity']
        refresh  = blending = @_get 'style.blending' if changed['style.blending']
        refresh  = zFactor  = @_get 'style.zFactor'  if changed['style.zFactor']
        refresh  = zUnits   = @_get 'style.zUnits'   if changed['style.zUnits']
        refresh  = zWrite   = @_get 'style.zWrite'   if changed['style.zWrite']
        refresh  = zTest    = @_get 'style.zTest'    if changed['style.zTest']
        onVisible() if refresh?

      last = null
      onVisible = () =>
        order  = zOrder ? @node.order

        active = visible
        active = opacity > 0            if active
        active = objectParent.isVisible if active and objectParent?

        if active
          if hasStyle
            for o in @objects
              o.show opacity < 1, blending, order
              o.polygonOffset zFactor, zUnits
              o.depth zWrite, zTest
          else
            o.show true, blending, order for o in @objects
        else
          o.hide() for o in @objects

        @isVisible = active
        @trigger e if last != active
        last = active

      @_listen @node, 'change:object', onChange
      @_listen @node, 'change:style',  onChange
      @_listen @node, 'reindex',       onVisible

      @_listen objectParent, 'object.visible', onVisible if objectParent

      objectScene.adopt object for object in @objects
      onVisible()

    unmake: (dispose = true) ->
      return unless @objects

      objectScene  = @_inherit 'scene'
      objectScene.unadopt object for object in @objects
      object.dispose() for object in @objects if dispose

  renderScale:
    make: () ->
      @renderUniforms = {
        renderScale:  scale  = @_attributes.make @_types.number 0
        renderAspect: aspect = @_attributes.make @_types.number 0
        renderWidth:  width  = @_attributes.make @_types.number 0
        renderHeight: height = @_attributes.make @_types.number 0
      }

      handler = () =>
        if (size = root?.getSize())?
          width .value = size.renderWidth / 2
          height.value = size.renderHeight / 2
          aspect.value = size.aspect
          scale .value = height.value

      root = @_listen 'root', 'root.resize', handler
      handler()

    unmake: () ->
      delete @renderUniforms

    get: () ->
      u = @renderUniforms

      width:  u.renderWidth .value
      height: u.renderHeight.value
      aspect: u.renderAspect.value
      scale:  u.renderScale .value

    uniforms: () -> @renderUniforms


module.exports = (object, traits) ->
  h = {}
  for trait in traits
    continue unless methods = helpers[trait]

    h[trait] = {}
    h[trait][key] = method.bind(object) for key, method of methods
  h

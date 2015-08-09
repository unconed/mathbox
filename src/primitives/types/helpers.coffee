Util = require '../../util'
View = require './view/view'

###

This is the general dumping ground for trait behavior.

Helpers are auto-attached to primitives that have the matching trait

###

helpers =

  bind:
    make: (slots) ->
      @bind  ?= {}
      @bound ?= []

      # Fetch attached objects and bind to them
      # Attach rebuild watcher for DOM changes to bound nodes
      for slot in slots
        {to, trait, optional} = slot

        name     = to.split(/\./g).pop()
        selector = @_get to

        # Find by selector
        source = null
        if selector?
          start    = @
          unique   = false
          while !unique
            # Keep scanning back until a new node is found
            start  = source = @_attach selector, trait, @rebuild, @, start, optional
            unique = !source? or @bound.indexOf(source) < 0

        # Monitor source for reallocation / resize
        if source?
          @_listen source, 'source.resize',  @resize  if @resize?
          @_listen source, 'source.rebuild', @rebuild if @rebuild?
          @bound.push source

        @bind[name] = source

      null

    unmake: () ->
      return unless @bind
      delete @bind
      delete @bound

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
      styleZBias:   @node.attributes['style.zBias']
      styleZIndex:  @node.attributes['style.zIndex']

  arrow:
    # Return bound arrow style uniforms
    uniforms: () ->
      start   = @props.start
      end     = @props.end

      space = @_attributes.make @_types.number 1.25 / (start + end)
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
      pointDepth:  @node.attributes['point.depth']

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
      visible  = @props.visible
      blending = THREE.NormalBlending
      zWrite   = true
      zTest    = true

      if hasStyle
        opacity  = @props.opacity
        blending = @props.blending
        zOrder   = @props.zOrder
        zWrite   = @props.zWrite
        zTest    = @props.zTest

      onChange = (event) =>
        changed  = event.changed
        refresh  = null
        refresh  = visible  = @props.visible  if changed['object.visible']
        refresh  = opacity  = @props.opacity  if changed['style.opacity']
        refresh  = blending = @props.blending if changed['style.blending']
        refresh  = zWrite   = @props.zWrite   if changed['style.zWrite']
        refresh  = zTest    = @props.zTest    if changed['style.zTest']
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

    mask: () ->
      return unless mask = @_inherit('mask')
      shader = mask.mask shader

  unit:
    make: () ->
      π = Math.PI

      @unitUniforms = {
        renderScaleInv:   renderScaleInv  = @_attributes.make @_types.number 1
        renderScale:      renderScale     = @_attributes.make @_types.number 1
        renderAspect:     renderAspect    = @_attributes.make @_types.number 1
        renderWidth:      renderWidth     = @_attributes.make @_types.number 0
        renderHeight:     renderHeight    = @_attributes.make @_types.number 0
        viewWidth:        viewWidth       = @_attributes.make @_types.number 0
        viewHeight:       viewHeight      = @_attributes.make @_types.number 0
        pixelRatio:       pixelRatio      = @_attributes.make @_types.number 1
        pixelUnit:        pixelUnit       = @_attributes.make @_types.number 1
        worldUnit:        worldUnit       = @_attributes.make @_types.number 1
        focusDepth:       focusDepth      = @_attributes.make @_types.number 1
        renderOdd:        renderOdd       = @_attributes.make @_types.vec2()
      }

      top    = new THREE.Vector3()
      bottom = new THREE.Vector3()

      handler = () =>
        return unless (size = root?.getSize())?

        π = Math.PI

        scale = @props.scale
        fov   = @props.fov
        focus = @props.focus

        isAbsolute = scale == null

        # Measure live FOV to be able to accurately predict anti-aliasing in perspective
        measure = 1
        if (camera = root?.getCamera())
          m = camera.projectionMatrix
          # Measure top to bottom
          top   .set(0, -.5, 1).applyProjection(m)
          bottom.set(0,  .5, 1).applyProjection(m)
          top.sub bottom
          measure = top.y

        # Calculate device pixel ratio
        dpr      = size.renderHeight / size.viewHeight

        # Calculate correction for fixed on-screen size regardless of FOV
        fovtan   = if fov? then measure * Math.tan(fov * π / 360) else 1

        # Calculate device pixels per virtual pixel
        pixel    = if isAbsolute then dpr else size.renderHeight / scale * fovtan

        # Calculate device pixels per world unit
        rscale   = size.renderHeight * measure / 2

        # Calculate world units per virtual pixel
        world    = pixel / rscale

        viewWidth     .value = size.viewWidth
        viewHeight    .value = size.viewHeight
        renderWidth   .value = size.renderWidth
        renderHeight  .value = size.renderHeight
        renderAspect  .value = size.aspect
        renderScale   .value = rscale
        renderScaleInv.value = 1 / rscale
        pixelRatio    .value = dpr
        pixelUnit     .value = pixel
        worldUnit     .value = world
        focusDepth    .value = focus

        renderOdd     .value.set(size.renderWidth % 2, size.renderHeight % 2).multiplyScalar(.5);

        #console.log 'worldUnit', world, pixel, rscale, isAbsolute

      root = if @is 'root' then @ else @_inherit 'root'
      #@_listen root, 'root.resize', handler
      #@_listen root, 'root.camera', handler
      #@_listen @node, 'change:unit', handler
      @_listen root,  'root.update', handler

      handler()

    unmake: () ->
      delete @unitUniforms

    get: () ->
      u = {}
      u[k] = v.value for k, v of @unitUniforms
      u

    uniforms: () -> @unitUniforms

module.exports = (object, traits) ->
  h = {}
  for trait in traits
    continue unless methods = helpers[trait]

    h[trait] = {}
    h[trait][key] = method.bind(object) for key, method of methods
  h

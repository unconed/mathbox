Util = require '../../util'
View = require './view/view'

###

This is the general dumping ground for trait behavior.

Helpers are auto-attached to primitives that have the matching trait

###

helpers =

  bind:
    make: (map) ->
      @_helpers.bind.unmake() if @handlers.bindRebuild

      @bind = {}

      # Monitor array for reallocation / resize
      @handlers.bindResize   = (event) => @resize()
      @handlers.bindRebuild  = (event) =>
        @rebuild()
        @trigger
          type: 'rebuild'
      @handlers.bindWatchers = watchers = []

      # Fetch attached objects and bind to them
      # Attach watchers for DOM changes
      for key, trait of map
        watcher = () => @rebuild()
        watchers.push watcher

        name   = key.split(/\./g).pop()
        source = @_attach key, trait, watcher

        if source
          source.on 'resize',  @handlers.bindResize
          source.on 'rebuild', @handlers.bindRebuild

        @bind[name] = source

      null

    unmake: () ->
      # Unbind from attached objects
      for key, source of @bind when source
        source.off 'resize',  @handlers.bindResize
        source.off 'rebuild', @handlers.bindRebuild

      # Stop watching selector (if any)
      watcher.unwatch?() for watcher in @handlers.bindWatchers

      delete @handlers.bindResize
      delete @handlers.bindRebuild
      delete @bind

  span:
    make: () ->
      # Look up nearest view to inherit from
      # Monitor size changes
      @spanView = @_inherit 'view'
      if @spanView?
        @handlers.span = (event) => @change {}, {}, {}, true
        @spanView.on 'range', @handlers.span

    unmake: () ->
      if @spanView?
        @spanView.off 'range', @handlers.span
        delete @handlers.span
      delete @spanView

    get: do ->
      def = new THREE.Vector2 -1, 1

      (prefix, dimension) ->
        # Return literal range
        range = @_get prefix + 'span.range'
        return range if range?

        # Inherit from view
        if @spanView?
          return @spanView.axis dimension

        return def

  scale:
    # Divisions to allocate on scale
    divide: (prefix) ->
      divide = @_get prefix + 'scale.divide'
      divide * 2.5

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
    make: () ->
      # Look up nearest view to inherit from
      # Monitor size changes
      @positionView = @_inherit 'view'
      dims = @positionDims = @positionView?.dimensions() ? 3

      @objectMatrix = @_attributes.make @_attributes.types.mat4()
      @object4D     = @_attributes.make @_attributes.types.vec2() if dims == 4

      # Recalculate transform if P/R/S changes
      recalc = () =>
        o = @_get 'object.position'
        s = @_get 'object.scale'
        q = @_get 'object.rotation'

        @objectMatrix.value.compose o, q, s
        @object4D    .value.set o.w, s.w if dims == 4

      @handlers.position = (event) =>
        changed = event.changed
        if changed['object.position'] or
           changed['object.rotation'] or
           changed['object.scale']
          recalc()

      @node.on  'change:object', @handlers.position
      recalc()

    unmake: () ->
      @node.off 'change:object', @handlers.position

      delete @objectMatrix
      delete @object4D
      delete @handlers.position
      delete @positionView
      delete @positionDims

    shader: (shader, inline) ->
      id = switch @positionDims
        when 4 then 'object4.position'
        else 'object.position'

      shader.pipe id,
        objectMatrix: @objectMatrix
        object4D:     @object4D

      @transform shader unless inline
      @present   shader unless inline

  object:
    # Generic 3D renderable wrapper, handles the fiddly Three.js bits that require a 'style recalculation'.
    #
    # Pass renderables to nearest root for rendering
    # Track visibility from parent and notify children
    # Track blends / transparency for three.js materials
    make: (@objects = [], forceTransparent = false) ->
      @objectParent = @_inherit 'object'
      @objectScene  = @_inherit 'scene'

      e       = type: 'visible'
      opacity = blending = zIndex = zFactor = null

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

      onChange = @handlers.objectChange = (event) =>
        changed  = event.changed
        refresh  = null
        refresh  = visible  = @_get 'object.visible' if changed['object.visible']
        refresh  = opacity  = @_get 'style.opacity'  if changed['style.opacity']
        refresh  = blending = @_get 'style.blending' if changed['style.blending']
        refresh  = zFactor  = @_get 'style.zFactor'  if changed['style.zFactor']
        refresh  = zUnits   = @_get 'style.zUnits'   if changed['style.zUnits']
        refresh  = zWrite   = @_get 'style.zWrite'   if changed['style.zWrite']
        refresh  = zTest    = @_get 'style.zWrite'   if changed['style.zTest']
        onVisible() if refresh?

      last = null
      onVisible = @handlers.objectVisible = () =>
        order  = zOrder ? @node.order

        active = visible
        active = opacity > 0             if active
        active = @objectParent.isVisible if active and @objectParent?

        if active
          if hasStyle
            for o in @objects
              o.show opacity < 1 or forceTransparent, blending, order
              o.polygonOffset zFactor, zUnits
              o.depth zWrite, zTest
          else
            o.show false, blending, order for o in @objects
        else
          o.hide() for o in @objects

        @isVisible = active
        @trigger e if last != active
        last = active

      @node.on    'change:object', onChange
      @node.on    'change:style',  onChange
      @node.on    'reindex',       onVisible
      @objectParent?.on 'visible', onVisible

      @objectScene.adopt object for object in @objects

      onVisible()

    unmake: (dispose = true) ->
      @objectScene.unadopt object for object in @objects
      object.dispose() for object in @objects if dispose

      onChange  = @handlers.objectChange
      onVisible = @handlers.objectVisible

      @node.off    'change:object', onChange
      @node.off    'change:style',  onChange
      @node.off    'reindex',       onVisible
      @objectParent?.off 'visible', onVisible

      delete @handlers.objectChange
      delete @handlers.objectVisible

      delete @objectVisible
      delete @objectParent
      delete @objectScene

  renderScale:
    make: () ->
      @renderRoot = @_inherit 'root'

      @render =
        scale: scale = @_attributes.make @_types.number 0

      @handlers.renderResize = (event) => scale.value = @root.size.renderHeight / 2
      @handlers.renderResize()

      @renderRoot?.on 'resize',  @handlers.renderResize

    unmake: () ->
      @renderRoot?.off 'resize', @handlers.renderResize
      delete @handlers.renderResize

    uniforms: () ->
      renderScale: @render.scale


module.exports = (object, traits) ->
  h = {}
  for trait in traits
    continue unless methods = helpers[trait]

    h[trait] = {}
    h[trait][key] = method.bind(object) for key, method of methods
  h

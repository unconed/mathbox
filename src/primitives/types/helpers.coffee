Util = require '../../util'
View = require './view/view'

###

This is the general dumping ground for trait behavior.

Helpers are auto-attached to primitives that have the matching trait

###

helpers =

  render:
    make: () ->
      @render =
        scale: scale = @_attributes.make @_types.number 0

      @handlers.renderResize = (event) => scale.value = @root.size.renderHeight / 2
      @handlers.renderResize()

      @root.on 'resize',  @handlers.renderResize

    unmake: () ->
      @root.off 'resize', @handlers.renderResize
      delete @handlers.renderResize

    uniforms: () ->
      renderScale: @render.scale

  bind:
    make: (map) ->
      @_helpers.bind.unmake() if @handlers.rebuild

      @bind = {}

      # Monitor array for reallocation / resize
      @handlers.bindResize  = (event) => @resize()
      @handlers.bindRebuild = (event) => @rebuild()

      # Fetch attached objects and bind
      for key, klass of map
        name = key.split(/\./g).pop()
        source = @_attached key, klass

        source.on 'resize',  @handlers.bindResize
        source.on 'rebuild', @handlers.bindRebuild

        @bind[name] = source

      null

    unmake: () ->
      # Unbind from attached objects
      for key, source of @bind
        source.off 'resize',  @handlers.bindResize
        source.off 'rebuild', @handlers.bindRebuild

      delete @handlers.bindResize
      delete @handlers.bindRebuild
      delete @bind

  span:
    make: () ->
      # Look up nearest view to inherit from
      # Monitor size changes
      @span = @_inherit View
      if @span?
        @handlers.span = (event) => @change {}, {}, true
        @span.on 'range', @handlers.span

    unmake: () ->
      if @span?
        @span.off 'range', @handlers.span
        delete @handlers.span
      delete @span

    get: do ->
      def = new THREE.Vector2 -1, 1

      (prefix, dimension) ->
        # Return literal range
        range = @_get prefix + 'span.range'
        return range if range?

        # Inherit from view
        if @span?
          return @span.axis dimension

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
      styleZBias:   @node.attributes['style.zBias']

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
      @position   = @_inherit View
      dims = @dimensions = @position?.dimensions() ? 3

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
      delete @handlers.position

    shader: (shader, inline) ->
      id = switch @dimensions
        when 4 then 'object4.position'
        else 'object.position'

      shader.call id,
        objectMatrix: @objectMatrix
        object4D:     @object4D

      @transform shader unless inline
      @present   shader unless inline

  object:

    # Merge multiple uniforms objects
    merge: () ->
      x = {}
      (x[k] = v for k, v of obj) for obj in arguments
      x

    # Notify outside controller of renderables
    render: (object) ->
      @trigger
        type: 'render'
        renderable: object

    unrender: (object) ->
      @trigger
        type: 'unrender'
        renderable: object

    # Track visibility
    # Propagate a node's visibility changes to its children
    make: (@objects = []) ->
      e = type: 'visible'

      @handlers.refresh = (event) =>
        changed = event.changed
        if changed['object.visible'] or
           changed['style.opacity']
          @handlers.visible()

      @handlers.visible = () =>
        opacity = 1
        visible = @_get 'object.visible'

        if visible and @node.attributes['style.opacity']
          opacity = @_get 'style.opacity'
          visible = opacity > 0

        if visible and @parent
          visible = @parent.visible

        for o in @objects
          if visible
            o.show opacity < 1
          else
            o.hide()

        @visible = visible
        @trigger e

      @node.on   'change:object', @handlers.refresh
      @node.on   'change:style',  @handlers.refresh
      @parent.on 'visible', @handlers.visible

      @handlers.visible()
      @_helpers.object.render object for object in @objects

    unmake: () ->
      @_helpers.object.unrender object for object in @objects
      delete @visible

      @node.off   'change:object', @handlers.refresh
      @node.off   'change:style',  @handlers.refresh
      @parent.off 'visible', @handlers.visible

      delete @handlers.refresh
      delete @handlers.visible

module.exports = (object, traits) ->
  h = {}
  for trait in traits
    continue unless methods = helpers[trait]

    h[trait] = {}
    h[trait][key] = method.bind(object) for key, method of methods
  h

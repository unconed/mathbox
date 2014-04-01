Util = require '../../util'
View = require './view/view'

helpers =

  span:
    make: () ->
      # Look up nearest view to inherit from
      # Monitor size changes
      @span = @_inherit View
      @spanHandler = (event) => @change {}, {}, true
      @span.on 'range', @spanHandler

    unmake: () ->
      @span.off 'resize', @spanHandler
      delete @span
      delete @spanHandler

    get: (prefix, dimension) ->
      # Return literal range
      range = @_get prefix + 'span.range'
      return range if range?

      # Inherit from view
      if @span
        return @span.axis dimension

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

  arrow:
    # Return bound arrow style uniforms
    uniforms: () ->
      arrowSize:   @node.attributes['arrow.size']

  line:
    # Return bound line style uniforms
    uniforms: () ->
      lineWidth:   @node.attributes['line.width']

  surface:
    # Return bound line style uniforms
    uniforms: () -> {}
#      surfaceWat:   @node.attributes['line.width']

  position:
    make: () ->
      @objectMatrix = @_attributes.make @_attributes.types.mat4()

      @handlers.position = (event) =>
        changed = event.changed
        if changed['object.position'] or
           changed['object.rotation'] or
           changed['object.scale']
          recalc()

      recalc = () =>
        o = @_get 'object.position'
        s = @_get 'object.scale'
        q = @_get 'object.rotation'

        @objectMatrix.value.compose o, q, s

      @node.on  'change:object', @handlers.position
      recalc()

    unmake: () ->
      @node.off 'change:object', @handlers.position

      delete @objectMatrix
      delete @handler.position

    shader: (shader) ->
      shader.call 'object.position',
        objectMatrix: @objectMatrix

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
      @_helper.object.render object for object in @objects

    unmake: () ->
      @_helper.object.unrender object for object in @objects
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

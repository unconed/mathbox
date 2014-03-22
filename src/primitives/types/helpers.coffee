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
      range = @_get prefix + 'span.range'
      return range if range?

      if @span
        return @span.axis dimension

  scale:
    divide: (prefix) ->
      divide = @_get prefix + 'scale.divide'
      divide * 2.5

    generate: (prefix, buffer, min, max) ->
      divide = @_get prefix + 'scale.divide'
      unit   = @_get prefix + 'scale.unit'
      base   = @_get prefix + 'scale.base'
      mode   = @_get prefix + 'scale.mode'

      ticks = Util.Ticks.make mode, min, max, divide, unit, base, true, 0
      buffer.copy ticks
      ticks

  line:
    uniforms: () ->
      lineWidth:   @node.attributes['line.width']
      lineColor:   @node.attributes['style.color']
      lineOpacity: @node.attributes['style.opacity']

  object:
    # Notify controller of renderables
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
    methods = helpers[trait]
    continue unless methods

    h[trait] = {}
    h[trait][key] = method.bind(object) for key, method of methods
  h

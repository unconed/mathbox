Data = require './data'

class Array_ extends Data
  @traits: ['node', 'data', 'array']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @buffer = null
    @space  = 0
    @length = 0
    @filled = false

  shader: (shader) ->
    shader.call 'map.2d.xyzw', @sampleUniforms
    @buffer.shader shader

  getDimensions: () ->
    items:  @items
    width:  @space
    height: @history
    depth:  1

  getActive: () ->
    items:  @items
    width:  @length
    height: @history
    depth:  1

  make: () ->
    super

    length   = @_get 'array.length'
    history  = @_get 'array.history'
    channels = @_get 'data.dimensions'
    items    = @_get 'data.items'

    @space    = Math.max @space, length
    @items    = items
    @channels = channels
    @history  = history

    # Allocate to right array size right away
    data = @_get 'data.data'
    if data?
      if data[0]?.length
        @space = Math.max @space, data.length / items
      else
        @space = Math.max @space, Math.floor data.length / channels / items

    @length = @space

    # Prepare sampling uniforms
    @sampleUniforms =
      textureItems:  @_attributes.make @_types.number items
      textureHeight: @_attributes.make @_types.number 1

    # Create linebuffer
    if @space > 0
      @buffer = @_renderables.make 'linebuffer',
                items:    @items
                length:   @space
                history:  @history
                channels: @channels

    # Notify of buffer reallocation
    @trigger
      type: 'rebuild'

  unmake: () ->
    super
    if @buffer
      @buffer.dispose()
      @buffer = null

  change: (changed, touched, init) ->
    @rebuild() if touched['array'] or changed['data.dimensions']

    return unless @buffer

    if changed['data.expression']? or
       init

      callback = @_get 'data.expression'
      @buffer.callback = @callback callback

  update: () ->
    return unless @buffer
    return unless !@filled or @_get 'data.live'
    return unless @parent.visible

    data = @_get 'data.data'

    length = @length

    if data?
      if data[0]?.length
        @length = data.length / @items
      else
        @length = Math.floor data.length / @channels / @items

      if @length > @space
        @space = Math.min @length, @space * 2
        @rebuild()
#      if @length < @space * .1
#        @space = @length
#        @rebuild()

      if data[0].length
        @buffer.copy2D data
      else
        @buffer.copy data

    else
      @length = @buffer.update()

    if length != @length
      @trigger
        type: 'resize'

    @filled = true


module.exports = Array_

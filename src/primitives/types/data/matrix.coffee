Data = require './data'

class Matrix extends Data
  @traits: ['node', 'data', 'matrix']

  constructor: (model, attributes, factory, shaders, helper) ->
    super model, attributes, factory, shaders, helper

    @buffer = null
    @spaceWidth  = 0
    @spaceHeight = 0
    @filled = false

  shader: (shader) ->
    @buffer.shader shader

  make: () ->
    super

    width    = @_get 'matrix.width'
    height   = @_get 'matrix.height'
    history  = @_get 'matrix.history'
    channels = @_get 'data.dimensions'

    @channels = channels
    @history  = history

    # Allocate to right matrix size right away
    data = @_get 'data.data'
    if data?
      if data[0]?.length
        if data[0][0]?.length
          @spaceWidth = Math.max @spaceWidth, data[0].length
        else
          @spaceWidth = Math.max @spaceWidth, data[0].length / @channels
        @spaceHeight = Math.max @spaceHeight, data.length
      else
        @spaceHeight = Math.max @spaceHeight, Math.floor data.length / @spaceWidth

    @width  = @spaceWidth  = Math.max @spaceWidth, width
    @height = @spaceHeight = Math.max @spaceHeight, height

    # Create surfacebuffer
    if @spaceWidth * @spaceHeight > 0
      @buffer = @_factory.make 'surfacebuffer',
                width:    @spaceWidth
                height:   @spaceHeight
                history:  history
                channels: channels

    # Notify of buffer reallocation
    @trigger
      event: 'rebuild'

  unmake: () ->
    super
    if @buffer
      @buffer.dispose()
      @buffer = null

  change: (changed, touched, init) ->
    @rebuild() if touched['matrix'] or changed['data.dimensions']

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

    oldWidth  = @width
    oldHeight = @height

    width    = @spaceWidth
    height   = @spaceHeight
    channels = @channels

    if data?

      w = h = 0
      method = 'copy'

      # Autosize width/height based on data layout
      if data[0]?.length
        w = data[0].length
        h = data.length

        if !data[0][0]?.length
          w /= channels
          method = 'copy3D'
        else
          method = 'copy2D'
      else
        w = width
        h = data.length / channels / width
        method = 'copy'

      # Enlarge if needed
      if w > width           || h > height           #||
#         w < @bufwidth * .33 || h < @bufheight * .33
        @spaceWidth  = w
        @spaceHeight = h
        @rebuild()

      @buffer[method] data
      @width  = w
      @height = h

    else
      length  = @buffer.update()

      @width  = width
      @height = length / @width

    if oldWidth  != @width or
       oldHeight != @height
      @trigger
        type: 'resize'

    @filled = true

module.exports = Matrix
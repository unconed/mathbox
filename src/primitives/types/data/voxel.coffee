Data = require './data'

class Voxel extends Data
  @traits: ['node', 'data', 'source', 'voxel']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @buffer = null
    @filled = false

    @space =
      width:  0
      height: 0
      depth:  0

    @used =
      width:  0
      height: 0
      depth:  0

  sourceShader: (shader) ->
    @buffer.shader shader

  getDimensions: () ->
    space = @space

    items:  @items
    width:  space.width
    height: space.height
    depth:  space.depth

  getActive: () ->
    used = @used

    items:  @items
    width:  used.width
    height: used.height
    depth:  used.depth * @buffer.getFilled()

  make: () ->
    super

    width    = @_get 'voxel.width'
    height   = @_get 'voxel.height'
    depth    = @_get 'voxel.depth'
    channels = @_get 'data.dimensions'
    items    = @_get 'data.items'

    @items    = items
    @channels = channels

    # Allocate to right matrix size right away
    data = @_get 'data.data'
    if data?

      if data[0]?.length
        if data[0][0]?.length
          @spaceWidth = Math.max @spaceWidth, data[0].length / @items
        else
          @spaceWidth = Math.max @spaceWidth, data[0].length / @channels / @items

        @spaceHeight = Math.max @spaceHeight, data.length
      else
        @spaceHeight = Math.max @spaceHeight, Math.floor data.length / @channels / @items / @spaceWidth

    @width  = @spaceWidth  = Math.max @spaceWidth, width
    @height = @spaceHeight = Math.max @spaceHeight, height

    # Create matrix buffer
    if @spaceWidth * @spaceHeight > 0
      @buffer = @_renderables.make 'matrixBuffer',
                width:    @spaceWidth
                height:   @spaceHeight
                history:  history
                channels: channels
                items:    items

    # Notify of buffer reallocation
    @trigger
      type: 'rebuild'

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

      @buffer.callback = @callback @_get 'data.expression'

  update: () ->
    return unless @buffer
    return unless !@filled or @_get 'data.live'

    data = @_get 'data.data'

    oldWidth  = @width
    oldHeight = @height

    width    = @spaceWidth
    height   = @spaceHeight
    channels = @channels
    items    = @items

    filled   = @buffer.getFilled()

    if data?

      w = h = 0
      method = 'copy'

      # Autosize width/height based on data layout
      if data[0]?.length
        w = data[0].length / items
        h = data.length

        if !data[0][0]?.length
          w /= channels
          method = 'copy3D'
        else
          method = 'copy2D'
      else
        w = width
        h = data.length / channels / items / width
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
       oldHeight != @height or
       filled != @buffer.getFilled()
      @trigger
        type: 'resize'

    @filled = true

module.exports = Voxel
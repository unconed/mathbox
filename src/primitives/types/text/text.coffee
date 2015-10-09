Buffer = require '../data/buffer'
Voxel = require '../data/voxel'
Util = require '../../../util'

class Text extends Voxel
  @traits = ['node', 'buffer', 'active', 'data', 'texture', 'voxel', 'text', 'font']
  @defaults =
    minFilter: 'linear'
    magFilter: 'linear'
  @finals =
    channels: 1

  init: () ->
    super
    @atlas = null

  textShader: (shader) ->
    @atlas.shader shader

  textIsSDF:  () -> @props.sdf > 0
  textHeight: () -> @props.detail

  make: () ->
    # Read sampling parameters
    {minFilter, magFilter, type} = @props

    # Read font parameters
    {font, style, variant, weight, detail, sdf} = @props

    # Prepare text atlas
    @atlas = @_renderables.make 'textAtlas',
               font:      font
               size:      detail
               style:     style
               variant:   variant
               weight:    weight
               outline:   sdf
               minFilter: minFilter
               magFilter: magFilter
               type:      type

    # Underlying data buffer needs no filtering
    @minFilter = THREE.NearestFilter
    @magFilter = THREE.NearestFilter
    @type      = THREE.FloatType

    # Skip voxel::make(), as we need 4 channels internally in our buffer to store sprite x/y/w/h per string
    Buffer.prototype.make.call @

    # Read sampling parameters
    minFilter = @minFilter ? @props.minFilter
    magFilter = @magFilter ? @props.magFilter
    type      = @type      ? @props.type

    # Read given dimensions
    width    = @props.width
    height   = @props.height
    depth    = @props.depth
    reserveX = @props.bufferWidth
    reserveY = @props.bufferHeight
    reserveZ = @props.bufferDepth
    channels = @props.channels
    items    = @props.items

    dims = @spec = {channels, items, width, height, depth}

    @items    = dims.items
    @channels = dims.channels

    # Init to right size if data supplied
    data = @props.data
    dims = Util.Data.getDimensions data, dims

    space = @space
    space.width  = Math.max reserveX,  dims.width  || 1
    space.height = Math.max reserveY,  dims.height || 1
    space.depth  = Math.max reserveZ,  dims.depth  || 1

    # Create text voxel buffer
    @buffer = @_renderables.make @storage,
              width:     space.width
              height:    space.height
              depth:     space.depth
              channels:  4
              items:     items
              minFilter: minFilter
              magFilter: magFilter
              type:      type

    # Hook buffer emitter to map atlas text
    atlas = @atlas
    emit  = @buffer.streamer.emit
    @buffer.streamer.emit = (text) -> atlas.map text, emit

  unmake: () ->
    super
    if @atlas
      @atlas.dispose()
      @atlas = null

  update: () ->
    @atlas.begin()
    super
    @atlas.end()

  change: (changed, touched, init) ->
    return @rebuild() if touched['font']
    super changed, touched, init

module.exports = Text
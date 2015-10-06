Voxel = require '../data/voxel'
Util = require '../../../util'

class Text extends Voxel
  @traits = ['node', 'buffer', 'active', 'data', 'texture', 'voxel', 'text', 'font']
  @defaults =
    minFilter: 'linear'
    magFilter: 'linear'
  @finals =
    channels: 4

  init: () ->
    super
    @atlas = null

  textShader: (shader) ->
    @atlas.shader shader

  textIsSDF:  () -> @props.expand > 0
  textHeight: () -> @props.detail

  make: () ->
    # Read sampling parameters
    {minFilter, magFilter, type} = @props

    # Read font parameters
    {font, style, variant, weight, detail, expand} = @props

    # Prepare text atlas
    @atlas = @_renderables.make 'textAtlas',
               font:      font
               size:      detail
               style:     style
               variant:   variant
               weight:    weight
               outline:   expand
               minFilter: minFilter
               magFilter: magFilter
               type:      type

    # Underlying data buffer needs no filtering
    @minFilter = THREE.NearestFilter
    @magFilter = THREE.NearestFilter
    @type      = THREE.FloatType

    super

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
Voxel = require './voxel'
Util = require '../../../util'

class Text extends Voxel
  @traits = ['node', 'buffer', 'data', 'texture', 'voxel', 'text']
  @defaults =
    channels:         4
    minFilter: 'linear'
    magFilter: 'linear'

  init: () ->
    super
    @atlas = null

  textShader: (shader) ->
    @atlas.shader shader

  textIsSDF:  () -> @props.expand > 0
  textHeight: () -> @props.detail

  make: () ->
    # Read sampling parameters
    minFilter = @props.minFilter
    magFilter = @props.magFilter
    type      = @props.type

    # Read font parameters
    font    = @props.font
    style   = @props.style
    detail  = @props.detail
    expand  = @props.expand

    # Prepare text atlas
    @atlas = @_renderables.make 'textAtlas',
               font:      font
               size:      detail
               style:     style
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
    @buffer.streamer.emit = (t) -> atlas.map t, emit

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
    return @rebuild() if touched['text']
    super changed, touched, init

module.exports = Text
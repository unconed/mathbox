Voxel = require './voxel'
Util = require '../../../util'

class Text extends Voxel
  @traits = ['node', 'data', 'source', 'texture', 'voxel', 'text']
  @defaults =
    channels:       4
    minFilter: 'linear'
    magFilter: 'linear'

  init: () ->
    super
    @atlas = null

  textIsSDF:  () -> @_get('text.expand') > 0
  textHeight: () -> @_get('text.detail')

  textShader: (shader) ->
    @atlas.shader shader

  make: () ->
    # Read sampling parameters
    minFilter = @_get 'texture.minFilter'
    magFilter = @_get 'texture.magFilter'
    type      = @_get 'texture.type'

    # Read font parameters
    font    = @_get 'text.font'
    style   = @_get 'text.style'
    detail  = @_get 'text.detail'
    expand  = @_get 'text.expand'

    # Prepare text atlas
    @atlas = @_renderables.make 'textAtlas',
               font:      font
               size:      detail
               style:     style
               outline:   expand
               minFilter: minFilter
               magFilter: magFilter
               type:      type

    # DEBUG
    #dbg = @_renderables.make 'debug',
    #        map: @atlas.read()
    #scene = @_inherit 'scene'
    #scene.adopt dbg
    #dbg.objects[0].quaternion.set Math.sin(π / 2), 0, 0, Math.cos(π / 2)
    
    super

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

  callback: (callback) ->
    text = ''
    atlas = @atlas

    buffer = (t) -> text = t    
    (emit, i, j, k, l) ->
      callback  buffer, i, j, k, l
      atlas.map text, emit

module.exports = Text
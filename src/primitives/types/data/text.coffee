Voxel = require './voxel'
Util = require '../../../util'

class Text extends Voxel
  @traits = ['node', 'data', 'source', 'texture', 'voxel', 'text']
  @defaults =
    dimensions:       4
    minFilter: 'linear'
    magFilter: 'linear'

  init: () ->
    super
    @atlas = @isOutlined = null

  textIsOutlined: () -> @isOutlined

  textShader: (shader) ->
    @atlas.shader shader

  make: () ->
    # Read sampling parameters
    minFilter = @_get 'texture.minFilter'
    magFilter = @_get 'texture.magFilter'
    type      = @_get 'texture.type'

    # Read font parameters
    font    = @_get 'text.font'
    outline = @_get 'text.outline'

    # Prepare text atlas
    @atlas = @_renderables.make 'textAtlas',
               font:    font
               outline: outline
               minFilter: minFilter
               magFilter: magFilter
               type:      type

    @isOutlined = outline > 0
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
    return @rebuild() if changed['text.font']
    super changed, touched, init

  callback: (callback) ->
    text = ''
    atlas = @atlas

    buffer = (t) -> text = t    
    (emit, i, j, k, l) ->
      callback  buffer, i, j, k, l
      atlas.map text, emit

module.exports = Text
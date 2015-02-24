Root = require '../base/root'
Util = require '../../../util'

class RTT extends Root
  @traits = ['node', 'root', 'scene', 'transform', 'texture', 'rtt', 'source', 'index', 'image']
  @defaults =
    minFilter: 'linear',
    magFilter: 'linear',
    type:      'unsignedByte',

  init: () ->
    @rtt = @scene = @width = @height = @history = @size = null

    @event =
      type: 'root.update'

  indexShader: (shader) -> shader

  imageShader: (shader) ->
    @rtt.shaderRelative shader

  sourceShader: (shader) ->
    @rtt.shaderAbsolute shader, @history

  update: () ->
    @trigger @event
    @rtt?.render()

  getDimensions: () ->
    items:  1
    width:  @width
    height: @height
    depth:  @history

  getActive: () -> @getDimensions()

  make: () ->
    @parentRoot = @_inherit 'root'
    @size = @parentRoot.getSize()

    @_listen @parentRoot, 'root.update', @update
    @_listen @parentRoot, 'root.resize', (event) -> @resize event.size

    return unless @size?

    minFilter = @_get 'texture.minFilter'
    magFilter = @_get 'texture.magFilter'
    type      = @_get 'texture.type'

    @width   = @_get('rtt.width')  ? @size.renderWidth
    @height  = @_get('rtt.height') ? @size.renderHeight
    @history = @_get 'rtt.history'

    @scene ?= @_renderables.make 'scene'
    @rtt    = @_renderables.make 'renderToTexture',
      scene:     @scene
      width:     @width
      height:    @height
      frames:    @history
      minFilter: minFilter
      magFilter: magFilter
      type:      type

  made: () ->
    # Notify of buffer reallocation
    @trigger
      type: 'source.rebuild'

    if @size
      @trigger
        type: 'root.resize'
        size: @size

  unmake: (rebuild) ->
    @parentRoot.off 'root.update', @updateHandler
    @parentRoot.off 'root.resize', @resizeHandler

    return unless @rtt?

    @rtt.dispose()
    @scene.dispose() unless rebuild

    @rtt = @width = @height = @history = null

  change: (changed, touched, init) ->
    return @rebuild() if touched['texture']    or
                         changed['rtt.width']  or
                         changed['rtt.height']

    if @size?
      @rtt.camera.aspect = @size.aspect if @rtt?
      @rtt.camera.updateProjectionMatrix()

  adopt:   (renderable) -> @scene.add    object for object in renderable.objects
  unadopt: (renderable) -> @scene.remove object for object in renderable.objects

  resize: (size) ->
    @size = size
    
    width  = @_get 'rtt.width'
    height = @_get 'rtt.height'
    
    return @rebuild() if !width? or !height?
    @trigger
      type: 'source.resize'    

  # End transform chain here
  transform: (shader, pass) ->
    return shader.pipe 'view.position'            if pass == 2
    return shader.pipe Util.GLSL.truncateVec 4, 3 if pass == 3
    shader

module.exports = RTT
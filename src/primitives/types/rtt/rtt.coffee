Root = require '../base/root'
Util = require '../../../util'

class RTT extends Root
  @traits = ['node', 'root', 'scene', 'transform', 'texture', 'rtt', 'source', 'index', 'image']
  @defaults =
    minFilter: 'linear',
    magFilter: 'linear',
    type:      'unsignedByte',

  init: () ->
    @rtt = @scene = @width = @height = @history = @rootSize = @size = null

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
    @rootSize = @parentRoot.getSize()

    @_listen @parentRoot, 'root.update', @update
    @_listen @parentRoot, 'root.resize', (event) -> @resize event.size

    return unless @rootSize?

    minFilter = @_get 'texture.minFilter'
    magFilter = @_get 'texture.magFilter'
    type      = @_get 'texture.type'

    width     = @_get 'rtt.width'
    height    = @_get 'rtt.height'
    history   = @_get 'rtt.history'
    
    @width    = width  ? @rootSize.renderWidth
    @height   = height ? @rootSize.renderHeight
    @history  = history
    @aspect   = aspect = @width / @height
    
    @scene ?= @_renderables.make 'scene'
    @rtt    = @_renderables.make 'renderToTexture',
      scene:     @scene
      width:     @width
      height:    @height
      frames:    @history
      minFilter: minFilter
      magFilter: magFilter
      type:      type
  
    aspect     = if width or height then aspect else @rootSize.aspect
    viewWidth  = width  ? @rootSize.viewWidth
    viewHeight = height ? @rootSize.viewHeight
  
    @size =
      renderWidth:  @width
      renderHeight: @height
      aspect:       aspect
      viewWidth:    viewWidth
      viewHeight:   viewHeight
      pixelRatio:   @height / viewHeight

    @rtt.camera.aspect = aspect
    @rtt.camera.updateProjectionMatrix()

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

  adopt:   (renderable) -> @scene.add    object for object in renderable.objects
  unadopt: (renderable) -> @scene.remove object for object in renderable.objects

  resize: (size) ->
    @rootSize = size
    
    width  = @_get 'rtt.width'
    height = @_get 'rtt.height'
    
    return @rebuild() if !@rtt or !width? or !height?

  # End transform chain here
  transform: (shader, pass) ->
    return shader.pipe 'view.position'            if pass == 2
    return shader.pipe Util.GLSL.truncateVec 4, 3 if pass == 3
    shader

module.exports = RTT
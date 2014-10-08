Root = require '../base/root'

class RTT extends Root
  @traits = ['node', 'root', 'scene', 'texture', 'rtt', 'source', 'image']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @rtt = @scene = @width = @height = @history = @size = null

    @event =
      type: 'update'

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

    @updateHandler = (event) => @update()
    @resizeHandler = (event) => @resize event.size

    @parentRoot.on 'root.update', @updateHandler
    @parentRoot.on 'root.resize', @resizeHandler

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

    # Notify of buffer reallocation
    @trigger
      type: 'source.rebuild'

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
      @trigger
        type: 'root.resize'
        size: @size

  adopt:   (renderable) -> @scene.add    object for object in renderable.objects
  unadopt: (renderable) -> @scene.remove object for object in renderable.objects

  resize: (size) ->
    @size = size
    @change {}, { texture: true }, {}, true

  # End transform chain here
  transform: (shader) ->
  present: (shader) ->
    shader.pipe 'view.position'

module.exports = RTT
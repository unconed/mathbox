Root = require '../base/root'

class RTT extends Root
  @traits = ['node', 'root', 'scene', 'texture', 'rtt', 'source', 'image', 'frames']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @rtt = @scene = @width = @height = @frames = @size = null

    @event =
      type: 'update'

  framesShader: (shader) ->
    @rtt.shaderRelative shader, true

  imageShader: (shader) ->
    @rtt.shaderRelative shader

  sourceShader: (shader) ->
    @rtt.shaderAbsolute shader, @expose > 1

  update: () ->
    @trigger @event
    @rtt.render()

  getDimensions: () ->
    items:  1
    width:  @width
    height: @height
    depth:  @expose

  getActive: () -> @getDimensions()

  make: () ->
    @parentRoot = @_inherit 'root'
    @size = @parentRoot.getSize()

    @updateHandler = (event) => @update()
    @resizeHandler = (event) => @resize event.size

    @parentRoot.on 'update', @updateHandler
    @parentRoot.on 'resize', @resizeHandler

    return unless @size?

    @width  = @_get('texture.width')  ? @size.renderWidth
    @height = @_get('texture.height') ? @size.renderHeight
    @frames = @_get('rtt.history') + 1
    @expose = Math.min @frames, @_get('rtt.expose')

    @scene ?= @_renderables.make 'scene'
    @rtt    = @_renderables.make 'renderToTexture',
      scene:  @scene
      width:  @width
      height: @height
      frames: @frames

    ###
    @debug1 = @_renderables.make 'debug',
      x: -1,
      map: @rtt.read()

    @debug2 = @_renderables.make 'debug',
      x: 1,
      map: @rtt.read()

    root = @_inherit 'root'
    root.adopt @debug1
    root.adopt @debug2
    ###

    # Notify of buffer reallocation
    @trigger
      type: 'rebuild'

  unmake: (rebuild) ->
    @parentRoot.off 'update', @updateHandler
    @parentRoot.off 'resize', @resizeHandler

    return unless @rtt?

    ###
    root = @_inherit 'root'
    root.unadopt @debug1
    root.unadopt @debug2

    @debug1.dispose()
    @debug2.dispose()

    @debug1 = @debug2 = null
    ###

    @rtt.dispose()
    @scene.dispose() unless rebuild

    @rtt = @width = @height = @frames = null

  change: (changed, touched, init) ->
    @rebuild() if touched['texture'] or
                  changed['rtt.expose']

    if @size?
      @rtt.camera.aspect = @size.aspect if @rtt?
      @rtt.camera.updateProjectionMatrix()
      @trigger
        type: 'resize'
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
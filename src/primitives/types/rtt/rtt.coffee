Root = require '../base/root'

class RTT extends Root
  @traits = ['node', 'root', 'texture', 'rtt', 'source']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @rtt = @scene = @width = @height = @frames = @size = null

    @event =
      type: 'update'

  shader: (shader) ->
    @rtt.shader shader

  update: () ->
    @trigger @event

  getDimensions: () ->
    items:  1
    width:  @width
    height: @height
    depth:  @frames

  getActive: () ->
    items:  1
    width:  @width
    height: @height
    depth:  Math.min @frames, @_get 'rtt.expose'

  make: () ->
    @parentRoot = @_inherit 'root'
    @size = @parentRoot.getSize()

    console.log 'rtt:make', @size

    @updateHandler = (event) => @update()
    @resizeHandler = (event) => @resize()

    @parentRoot.on 'update', @updateHandler
    @parentRoot.on 'resize', @resizeHandler

    return unless @size?

    @width  = @_get('texture.width')   ? @size.renderWidth
    @height = @_get('texture.height')  ? @size.renderHeight
    @frames = @_get('rtt.history') + 1

    @scene = @_renderables.make 'scene'
    @rtt   = @_renderables.make 'rtt',
      scene:  @scene
      width:  @width
      height: @height
      frames: @frames

    @debug = @_renderables.make 'debug',
      map: @rtt.read()

    root = @_inherit 'root'
    root.adopt @debug

  unmake: () ->
    @parentRoot.off 'update', @updateHandler
    @parentRoot.off 'resize', @resizeHandler

    console.log 'rtt:unmake', @rtt
    return unless @rtt?

    root = @_inherit 'root'
    root.unadopt @debug

    @rtt.dispose()
    @scene.dispose()

    @rtt = @scene = @width = @height = @frames = null

  change: (changed, touched, init) ->
    console.log 'rtt:change', changed, touched, init

    @rebuild if touched['texture']

    console.log 'rtt:change:size?', @size

    if @size?
      @trigger
        type: 'resize'
        size: @size

  adopt:   (renderable) -> @scene.add    object for object in renderable.objects
  unadopt: (renderable) -> @scene.remove object for object in renderable.objects

  resize: (size) ->
    @size = size
    @change {}, { texture: true }, true

  # End transform chain here
  transform: (shader) ->
  present: (shader) ->
    shader.call 'view.position'

module.exports = RTT
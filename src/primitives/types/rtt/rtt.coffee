Root = require '../base/root'

class RTT extends Root
  @traits = ['node', 'root', 'texture', 'rtt', 'source']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @rtt = @scene = @width = @height = @frames = @size = null

    @event =
      type: 'update'

  shader: (shader) ->
    shader.call 'map.2d.xyzw', @sampleUniforms
    @rtt.shader shader

  update: () ->
    @trigger @event

  getDimensions: () ->
    items:  1
    width:  0
    height: 0
    depth:  0

  getActive: () ->
    items:  1
    width:  0
    height: 0
    depth:  0

  make: () ->
    return unless @size?

    @updateRoot = @_inherit 'root'
    @updateHandler = (event) => @update()
    @updateRoot.on 'update', @updateHandler

    @width  = @_get('texture.width')  ? @size.renderWidth
    @height = @_get('texture.height') ? @size.renderHeight
    @frames = @_get('texture.history') + 1

    @scene = @_renderables.make 'scene'
    @rtt   = @_renderables.make 'rtt',
      scene:  @scene
      width:  @width
      height: @height
      frames: @frames

  unmake: () ->
    return unless @rtt?

    @updateRoot.off 'update', @updateHandler

    @rtt.dispose()
    @scene.dispose()

    @rtt = @scene = @width = @height = @frames = null

  change: (changed, touched, init) ->
    @rebuild if touched['texture']

    if @size?
      @trigger
        type: 'resize'
        size: @size

  render:   (renderable) -> @scene.add    object for object in renderable.objects
  unrender: (renderable) -> @scene.remove object for object in renderable.objects

  resize: (size) ->
    @size = size
    @change {}, { texture: true }, true

  # End transform chain here
  transform: (shader) ->
  present: (shader) ->
    shader.call 'view.position'

module.exports = RTT
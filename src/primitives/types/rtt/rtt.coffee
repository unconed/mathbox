Root = require '../base/root'

class RTT extends Root
  @traits = ['node', 'root', 'texture']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @size = null

    @event =
      type: 'update'

  make: () ->
    @scene = @_renderables.make 'scene'
    @rtt   = @_renderables.make 'rtt',
      scene: @scene

  unmake: () ->

  change: (changed, touched, init) ->
    @rebuild if changed['texture']

    @trigger
      type: 'resize'
      size: size

  render:   (renderable) -> @scene.add    object for object in renderable.objects
  unrender: (renderable) -> @scene.remove object for object in renderable.objects

  resize: (size) ->
    @size = size
    @change {}, {}, true

  update: () ->
    @trigger @event

  present: (shader) ->
    shader.call 'view.position'

module.exports = RTT
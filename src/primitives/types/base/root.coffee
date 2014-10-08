Parent = require './parent'

class Root extends Parent
  @traits = ['node', 'root', 'scene']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @size = null

    @event =
      type: 'root.update'

  adopt:   (renderable) -> @_context.scene.add    object for object in renderable.objects
  unadopt: (renderable) -> @_context.scene.remove object for object in renderable.objects

  select: (selector) ->
    @node.model.select selector

  watch: (selector, handler) ->
    @node.model.watch selector, handler

  unwatch: (handler) ->
    @node.model.unwatch handler

  resize: (size) ->
    @size = size
    @trigger
      type: 'root.resize'
      size: size

  getSize: () -> @size

  update: () ->
    @trigger @event

  present: (shader) ->
    shader.pipe 'view.position'

module.exports = Root
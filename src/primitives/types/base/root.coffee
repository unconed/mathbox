Parent = require './parent'

class Root extends Parent
  @traits = ['node', 'root']

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @size = null

    @event =
      type: 'update'

  render:   (renderable) -> @_context.scene.add    object for object in renderable.objects
  unrender: (renderable) -> @_context.scene.remove object for object in renderable.objects

  select: (selector) ->
    @node.model.select selector

  resize: (size) ->
    @size = size
    @trigger
      type: 'resize'
      size: size

  update: () ->
    @trigger @event

  present: (shader) ->
    shader.call 'view.position'

module.exports = Root
Parent = require './parent'

class Root extends Parent

  constructor: (node, context, helpers) ->
    super node, context, helpers

    @visible = true
    @size = null

    scene    = context.scene
    render   = (event) => scene.add    event.renderable.object
    unrender = (event) => scene.remove event.renderable.object

    added = (event) ->
      event.object.primitive.on  'render',   render
      event.object.primitive.on  'unrender', unrender

    removed = (event) ->
      event.object.primitive.off 'render',   render
      event.object.primitive.off 'unrender', unrender

    @node.on 'add',    added
    @node.on 'remove', removed

    @event =
      type: 'update'

  resize: (size) ->
    @size = size
    @trigger
      type: 'resize'
      size: size

  update: () ->
    @trigger @event

  transform: (shader) ->
    shader.call 'view.position'

module.exports = Root